import maplibregl, { Map } from 'maplibre-gl';
import * as turf from '@turf/turf';
import { RouteFeature } from '../types/mapTypes';

export function animateAirplane(map: Map, route: RouteFeature, onComplete: () => void) {
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