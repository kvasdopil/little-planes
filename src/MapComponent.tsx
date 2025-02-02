import { useEffect, useRef } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { airports } from './airportsData';
import { getTotalDailyFlights, dailyFlights } from './flightData';
import * as turf from '@turf/turf';
import { faPlane } from '@fortawesome/free-solid-svg-icons';

const sizeToScale = {
  small: 0.8,
  medium: 0.9,
  large: 1
};

// Helper function to create a geodesic line between two points
function createGeodesicLine(start: [number, number], end: [number, number]): [number, number][] {
  const points: [number, number][] = [];
  const steps = 100;

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;

    // Convert to radians
    const lat1 = (start[1] * Math.PI) / 180;
    const lon1 = (start[0] * Math.PI) / 180;
    const lat2 = (end[1] * Math.PI) / 180;
    const lon2 = (end[0] * Math.PI) / 180;

    // Great circle calculation
    const d = 2 * Math.asin(Math.sqrt(
      Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)
    ));

    const A = Math.sin((1 - fraction) * d) / Math.sin(d);
    const B = Math.sin(fraction * d) / Math.sin(d);

    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);

    const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    const lon = Math.atan2(y, x);

    // Convert back to degrees
    points.push([
      (lon * 180) / Math.PI,
      (lat * 180) / Math.PI
    ]);
  }

  return points;
}

type RouteFeature = {
  type: 'Feature';
  properties: {
    flightsPerDay: number;
    from: string;
    to: string;
  };
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
};

function createFlightRoutes(map: Map): RouteFeature[] {
  // Create GeoJSON for flight routes
  const routes = dailyFlights.map(flight => {
    const fromAirport = airports.find(a => a.name.includes(flight.from));
    const toAirport = airports.find(a => a.name.includes(flight.to));
    
    if (!fromAirport || !toAirport) return null;

    const coordinates = createGeodesicLine(
      fromAirport.coordinates,
      toAirport.coordinates
    );

    return {
      type: 'Feature' as const,
      properties: {
        flightsPerDay: flight.averageFlightsPerDay,
        from: flight.from,
        to: flight.to
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: coordinates
      }
    };
  }).filter((route): route is RouteFeature => route !== null);

  // Add the routes source and layer
  map.addSource('flight-routes', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection' as const,
      features: routes
    }
  });

  map.addLayer({
    id: 'flight-routes',
    type: 'line',
    source: 'flight-routes',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#D3D3D3',
      'line-width': 2,
      'line-opacity': 0.15
    }
  });

  return routes;
}

function animateAirplane(map: Map, route: RouteFeature, onComplete: () => void) {
  // Only check if map exists and has style
  if (!map || !map.getStyle()) {
    onComplete();
    return;
  }

  const planeId = `airplane-${Date.now()}`;
  
  try {
    // Clean up any existing layers and sources with this ID
    if (map.getLayer(planeId)) map.removeLayer(planeId);
    if (map.getSource(planeId)) map.removeSource(planeId);

    // Create a GeoJSON point feature for the airplane
    const point = {
      type: 'Feature' as const,
      properties: {
        bearing: 0
      },
      geometry: {
        type: 'Point' as const,
        coordinates: route.geometry.coordinates[0]
      }
    };

    // Calculate initial bearing
    if (route.geometry.coordinates.length > 1) {
      const initialBearing = turf.bearing(
        turf.point(route.geometry.coordinates[0]),
        turf.point(route.geometry.coordinates[1])
      );
      point.properties.bearing = initialBearing;
    }

    // Add a new source and layer for this specific airplane
    map.addSource(planeId, {
      type: 'geojson',
      data: point
    });

    map.addLayer({
      id: planeId,
      type: 'symbol',
      source: planeId,
      layout: {
        'icon-image': 'airplane',
        'icon-size': 0.6,
        'icon-rotate': ['-', ['coalesce', ['get', 'bearing'], 0], 90],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      },
      paint: {
        'icon-opacity': 1,
        'icon-color': '#ffffff'
      }
    });

    let progress = 0;
    let lastTimestamp: number | null = null;
    const SPEED = 250;

    // Calculate total route length in degrees
    let totalLength = 0;
    for (let i = 0; i < route.geometry.coordinates.length - 1; i++) {
      totalLength += turf.distance(
        turf.point(route.geometry.coordinates[i]),
        turf.point(route.geometry.coordinates[i + 1])
      );
    }

    let animationFrameId: number;

    function animate(timestamp: number) {
      try {
        if (!lastTimestamp) {
          lastTimestamp = timestamp;
          animationFrameId = requestAnimationFrame(animate);
          return;
        }

        const deltaTime = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;

        progress += (SPEED * deltaTime) / totalLength;
        
        if (progress >= 1) {
          cleanup();
          return;
        }

        const targetDistance = totalLength * progress;
        let currentDistance = 0;
        let currentIndex = 0;

        while (currentIndex < route.geometry.coordinates.length - 1) {
          const segmentDistance = turf.distance(
            turf.point(route.geometry.coordinates[currentIndex]),
            turf.point(route.geometry.coordinates[currentIndex + 1])
          );

          if (currentDistance + segmentDistance > targetDistance) {
            const segmentProgress = (targetDistance - currentDistance) / segmentDistance;
            const currentPos = route.geometry.coordinates[currentIndex];
            const nextPos = route.geometry.coordinates[currentIndex + 1];

            const position: [number, number] = [
              currentPos[0] + (nextPos[0] - currentPos[0]) * segmentProgress,
              currentPos[1] + (nextPos[1] - currentPos[1]) * segmentProgress
            ];

            const bearing = turf.bearing(
              turf.point(currentPos),
              turf.point(nextPos)
            );

            const source = map.getSource(planeId);
            if (source && source.type === 'geojson') {
              (source as maplibregl.GeoJSONSource).setData({
                type: 'Feature',
                properties: {
                  bearing: bearing
                },
                geometry: {
                  type: 'Point',
                  coordinates: position
                }
              });
            }
            break;
          }

          currentDistance += segmentDistance;
          currentIndex++;
        }

        animationFrameId = requestAnimationFrame(animate);
      } catch (error) {
        console.error('Animation error:', error);
        cleanup();
      }
    }

    function cleanup() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      try {
        if (map && map.getStyle()) {
          if (map.getLayer(planeId)) map.removeLayer(planeId);
          if (map.getSource(planeId)) map.removeSource(planeId);
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
      onComplete();
    }

    animationFrameId = requestAnimationFrame(animate);
  } catch (error) {
    console.error('Animation setup error:', error);
    onComplete();
  }
}

function createMarker(airport: { name: string; coordinates: [number, number]; size: 'small' | 'medium' | 'large' }, map: Map) {
  const size = airport.size;
  const iconElement = document.createElement('div');
  iconElement.style.position = 'relative';
  iconElement.style.width = '0';
  iconElement.style.height = '0';

  // Create dot element
  const dot = document.createElement('div');
  dot.style.width = `${sizeToScale[size] * 8}px`;
  dot.style.height = `${sizeToScale[size] * 8}px`;
  dot.style.borderRadius = '50%';
  dot.style.backgroundColor = '#D3D3D3';
  dot.style.position = 'absolute';
  dot.style.left = '50%';
  dot.style.top = '50%';
  dot.style.transform = 'translate(-50%, -50%)';
  iconElement.appendChild(dot);

  setTimeout(() => {
    const textElement = document.createElement('span');
    textElement.textContent = ` ${airport.name.replace('Airport', '').trim()}`;
    textElement.style.position = 'absolute';
    textElement.style.top = 'calc(100% + 4px)';
    textElement.style.left = '50%';
    textElement.style.transform = 'translateX(-50%)';
    textElement.style.fontSize = `${sizeToScale[size] * 12}px`;
    textElement.style.color = '#D3D3D3';

    iconElement.appendChild(textElement);
  }, 0);

  const airportName = airport.name.replace('Airport', '').trim();
  const dailyFlights = getTotalDailyFlights(airportName);
  
  new maplibregl.Marker({
    element: iconElement,
    draggable: false
  })
    .setLngLat(airport.coordinates)
    .setPopup(new maplibregl.Popup().setHTML(
      `<div style="color: #D3D3D3">
        <strong>${airportName}</strong><br>
        Average daily domestic flights: ${dailyFlights}
      </div>`
    ))
    .addTo(map);
}

function MapComponent() {
  const mapRef = useRef<Map | null>(null);
  const intervalRef = useRef<number | null>(null);
  const routesRef = useRef<RouteFeature[]>([]);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json',
      center: [18.6435, 60.1282],
      zoom: 5
    });

    mapRef.current = map;

    map.on('load', () => {
      const airplane = new Image();
      airplane.onload = () => {
        if (map.hasImage('airplane')) {
          map.removeImage('airplane');
        }
        map.addImage('airplane', airplane, { 
          pixelRatio: 1,
          sdf: true
        });
        
        const routes = createFlightRoutes(map);
        routesRef.current = routes;
        airports.forEach(airport => createMarker(airport, map));

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        intervalRef.current = window.setInterval(() => {
          const randomRoute = routes[Math.floor(Math.random() * routes.length)];
          animateAirplane(map, randomRoute, () => {
            // Just cleanup, no need to spawn new plane here
          });
        }, 1000);
      };

      // Use the FontAwesome plane icon path directly
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="32" height="32">
        <path fill="white" d="${faPlane.icon[4]}"/>
      </svg>`;
      
      airplane.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

      // Preload the image to ensure it's ready
      airplane.crossOrigin = 'anonymous';
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (map && map.getStyle()) {
        try {
          // Remove airplane image
          if (map.hasImage('airplane')) {
            map.removeImage('airplane');
          }
          
          // Clean up airplane layers and sources
          const layers = map.getStyle().layers || [];
          layers.forEach(layer => {
            if (layer.id.startsWith('airplane-')) {
              map.removeLayer(layer.id);
              if (map.getSource(layer.id)) {
                map.removeSource(layer.id);
              }
            }
          });
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }
      map.remove();
    };
  }, []);

  return <div id="map" style={{ height: '100vh', width: '100%' }} />;
}

export default MapComponent; 