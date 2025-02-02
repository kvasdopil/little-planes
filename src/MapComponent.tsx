import { useEffect, createElement, useRef } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane } from '@fortawesome/free-solid-svg-icons';
import ReactDOM from 'react-dom';
import { airports } from './airportsData';
import { getTotalDailyFlights, dailyFlights } from './flightData';
import * as turf from '@turf/turf';

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
      'line-opacity': 0.3
    }
  });

  return routes;
}

function animateAirplane(map: Map, route: RouteFeature, onComplete: () => void) {
  const planeId = `airplane-${Date.now()}`;
  
  // Create a GeoJSON point feature for the airplane
  const point = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Point' as const,
      coordinates: route.geometry.coordinates[0]
    }
  };

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
      'icon-size': 1.5,
      'icon-rotate': ['get', 'bearing'],
      'icon-rotation-alignment': 'map',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true
    },
    paint: {
      'icon-opacity': 1
    }
  });

  let currentIndex = 0;
  const STEPS_PER_FRAME = 0.5; // Reduced from 5 to 0.5 for 10x slower movement

  function animate() {
    if (currentIndex >= route.geometry.coordinates.length - 1) {
      if (map.getLayer(planeId)) map.removeLayer(planeId);
      if (map.getSource(planeId)) map.removeSource(planeId);
      onComplete();
      return;
    }

    // Move multiple steps per frame
    currentIndex = Math.min(currentIndex + STEPS_PER_FRAME, route.geometry.coordinates.length - 1);
    
    // Use Math.floor to ensure valid integer indices
    const currentPosIndex = Math.floor(Math.max(0, currentIndex - STEPS_PER_FRAME));
    const nextPosIndex = Math.floor(currentIndex);
    
    const currentPos = route.geometry.coordinates[currentPosIndex];
    const nextPos = route.geometry.coordinates[nextPosIndex];

    // Calculate bearing for airplane rotation
    const bearing = turf.bearing(
      turf.point(currentPos),
      turf.point(nextPos)
    );

    // Update airplane position and rotation
    const source = map.getSource(planeId);
    if (source && source.type === 'geojson') {
      (source as maplibregl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {
          bearing: bearing
        },
        geometry: {
          type: 'Point',
          coordinates: nextPos
        }
      });
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function startRandomFlightAnimation(map: Map, routes: RouteFeature[]) {
  // Pick a random route
  const randomRoute = routes[Math.floor(Math.random() * routes.length)];
  
  animateAirplane(map, randomRoute, () => {
    // Schedule next animation after 3 seconds
    setTimeout(() => startRandomFlightAnimation(map, routes), 3000);
  });
}

function createMarker(airport: { name: string; coordinates: [number, number]; size: 'small' | 'medium' | 'large' }, map: Map) {
  const size = airport.size;
  const iconElement = document.createElement('div');
  iconElement.style.position = 'relative';
  iconElement.style.width = '0';
  iconElement.style.height = '0';

  const icon = createElement(FontAwesomeIcon, {
    icon: faPlane,
    style: { fontSize: `${sizeToScale[size] * 24}px`, color: '#D3D3D3', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(-90deg) rotate(30deg)' }
  });
  ReactDOM.render(icon, iconElement);

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

  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json',
      center: [18.6435, 60.1282],
      zoom: 5
    });

    mapRef.current = map;

    map.on('load', () => {
      // Create a simple triangle icon for the airplane
      const size = 24;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#D3D3D3';
        ctx.beginPath();
        ctx.moveTo(size/2, 0);
        ctx.lineTo(size, size);
        ctx.lineTo(0, size);
        ctx.closePath();
        ctx.fill();

        // Convert canvas to ImageData
        const imageData = ctx.getImageData(0, 0, size, size);
        map.addImage('airplane', { width: size, height: size, data: new Uint8Array(imageData.data.buffer) });
      }

      // First create routes and markers
      const routes = createFlightRoutes(map);
      airports.forEach(airport => createMarker(airport, map));

      // Start animations
      startRandomFlightAnimation(map, routes);
    });

    return () => map.remove();
  }, []);

  return <div id="map" style={{ height: '100vh', width: '100%' }} />;
}

export default MapComponent; 