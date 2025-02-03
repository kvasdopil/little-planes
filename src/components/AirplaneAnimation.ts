import maplibregl, { Map } from 'maplibre-gl';
import * as turf from '@turf/turf';
import { RouteFeature } from '../types/mapTypes';

const AIRPLANE_SPEED = 250; // degrees per second
const RETURN_FLIGHT_DELAY = 200; // milliseconds

interface AnimationState {
  progress: number;
  lastTimestamp: number | null;
  animationFrameId?: number;
}

interface FlightConfig {
  route: RouteFeature;
  speed?: number;
  onComplete?: () => void;
  onReturnComplete?: () => void;
  returnDelay?: number;
  shouldReturn?: boolean;
}

function createReturnRoute(route: RouteFeature): RouteFeature {
  return {
    ...route,
    geometry: {
      ...route.geometry,
      coordinates: [...route.geometry.coordinates].reverse(),
    },
  };
}

function calculateTotalLength(coordinates: [number, number][]): number {
  return coordinates
    .slice(0, -1)
    .reduce(
      (total, coord, i) =>
        total +
        turf.distance(turf.point(coord), turf.point(coordinates[i + 1])),
      0
    );
}

function setupMapResources(
  map: Map,
  planeId: string,
  initialCoordinates: [number, number][],
  initialBearing: number
) {
  // Create a GeoJSON point feature for the airplane
  const point = {
    type: 'Feature' as const,
    properties: { bearing: initialBearing },
    geometry: {
      type: 'Point' as const,
      coordinates: initialCoordinates[0],
    },
  };

  // Add source and layer
  map.addSource(planeId, {
    type: 'geojson',
    data: point,
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
      'icon-ignore-placement': true,
    },
    paint: {
      'icon-opacity': 1,
      'icon-color': '#ffffff',
    },
  });
}

function cleanupMapResources(map: Map, planeId: string) {
  if (map && map.getStyle()) {
    if (map.getLayer(planeId)) map.removeLayer(planeId);
    if (map.getSource(planeId)) map.removeSource(planeId);
  }
}

function updatePlanePosition(
  map: Map,
  planeId: string,
  position: [number, number],
  bearing: number
) {
  const source = map.getSource(planeId);
  if (source && source.type === 'geojson') {
    (source as maplibregl.GeoJSONSource).setData({
      type: 'Feature',
      properties: { bearing },
      geometry: {
        type: 'Point',
        coordinates: position,
      },
    });
  }
}

function calculateCurrentPosition(
  coordinates: [number, number][],
  targetDistance: number
): { position: [number, number]; bearing: number } {
  let currentDistance = 0;
  let currentIndex = 0;

  while (currentIndex < coordinates.length - 1) {
    const segmentDistance = turf.distance(
      turf.point(coordinates[currentIndex]),
      turf.point(coordinates[currentIndex + 1])
    );

    if (currentDistance + segmentDistance > targetDistance) {
      const segmentProgress =
        (targetDistance - currentDistance) / segmentDistance;

      const currentPos = coordinates[currentIndex];
      const nextPos = coordinates[currentIndex + 1];

      const position: [number, number] = [
        currentPos[0] + (nextPos[0] - currentPos[0]) * segmentProgress,
        currentPos[1] + (nextPos[1] - currentPos[1]) * segmentProgress,
      ];

      const bearing = turf.bearing(turf.point(currentPos), turf.point(nextPos));

      return { position, bearing };
    }

    currentDistance += segmentDistance;
    currentIndex++;
  }

  // Fallback to last position if something goes wrong
  return {
    position: coordinates[coordinates.length - 1],
    bearing: 0,
  };
}

function initializeReturnFlight(map: Map, config: FlightConfig) {
  const returnRoute = createReturnRoute(config.route);
  const returnConfig: FlightConfig = {
    ...config,
    route: returnRoute,
    shouldReturn: false, // Prevent infinite returns
    onComplete: config.onReturnComplete || config.onComplete,
  };

  setTimeout(
    () => initializeFlight(map, returnConfig),
    config.returnDelay || RETURN_FLIGHT_DELAY
  );
}

function initializeFlight(map: Map, config: FlightConfig) {
  if (!map?.getStyle()) {
    config.onComplete?.();
    return;
  }

  const isReturnFlight = !config.shouldReturn;
  const planeId = `airplane-${Date.now()}${isReturnFlight ? '-return' : ''}`;
  const coordinates = config.route.geometry.coordinates;
  const totalLength = calculateTotalLength(coordinates);

  const state: AnimationState = {
    progress: 0,
    lastTimestamp: null,
  };

  try {
    // Calculate initial bearing
    const initialBearing =
      coordinates.length > 1
        ? turf.bearing(turf.point(coordinates[0]), turf.point(coordinates[1]))
        : 0;

    setupMapResources(map, planeId, coordinates, initialBearing);

    function animate(timestamp: number) {
      try {
        if (!state.lastTimestamp) {
          state.lastTimestamp = timestamp;
          state.animationFrameId = requestAnimationFrame(animate);
          return;
        }

        const deltaTime = (timestamp - state.lastTimestamp) / 1000;
        state.lastTimestamp = timestamp;
        state.progress +=
          ((config.speed || AIRPLANE_SPEED) * deltaTime) / totalLength;

        if (state.progress >= 1) {
          cleanup();
          return;
        }

        const targetDistance = totalLength * state.progress;
        const { position, bearing } = calculateCurrentPosition(
          coordinates,
          targetDistance
        );
        updatePlanePosition(map, planeId, position, bearing);

        state.animationFrameId = requestAnimationFrame(animate);
      } catch (error) {
        console.error('Animation frame error:', error);
        cleanup();
      }
    }

    function cleanup() {
      if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
      }

      try {
        cleanupMapResources(map, planeId);
      } catch (error) {
        console.error('Resource cleanup error:', error);
      }

      if (config.shouldReturn) {
        initializeReturnFlight(map, config);
      } else {
        config.onComplete?.();
      }
    }

    state.animationFrameId = requestAnimationFrame(animate);
  } catch (error) {
    console.error('Animation setup error:', error);
    cleanupMapResources(map, planeId);
    config.onComplete?.();
  }
}

// Main export function - maintains backward compatibility
export function animateAirplane(
  map: Map,
  route: RouteFeature,
  onComplete: () => void,
  isReturnFlight: boolean = false
) {
  const config: FlightConfig = {
    route,
    onComplete,
    shouldReturn: !isReturnFlight,
  };

  initializeFlight(map, config);
}
