import { Map } from 'maplibre-gl';
import { airports } from '../airportsData';
import { dailyFlights } from '../flightData';
import { RouteFeature } from '../types/mapTypes';

// Helper function to create a geodesic line between two points
function createGeodesicLine(
  start: [number, number],
  end: [number, number]
): [number, number][] {
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
    const d =
      2 *
      Math.asin(
        Math.sqrt(
          Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
            Math.cos(lat1) *
              Math.cos(lat2) *
              Math.pow(Math.sin((lon1 - lon2) / 2), 2)
        )
      );

    const A = Math.sin((1 - fraction) * d) / Math.sin(d);
    const B = Math.sin(fraction * d) / Math.sin(d);

    const x =
      A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y =
      A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);

    const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    const lon = Math.atan2(y, x);

    // Convert back to degrees
    points.push([(lon * 180) / Math.PI, (lat * 180) / Math.PI]);
  }

  return points;
}

export function createFlightRoutes(map: Map): RouteFeature[] {
  // Create GeoJSON for flight routes
  const routes = dailyFlights
    .map((flight) => {
      const fromAirport = airports.find((a) => a.name.includes(flight.from));
      const toAirport = airports.find((a) => a.name.includes(flight.to));

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
          to: flight.to,
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: coordinates,
        },
      };
    })
    .filter((route): route is RouteFeature => route !== null);

  // Add the routes source and layer
  map.addSource('flight-routes', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection' as const,
      features: routes,
    },
  });

  map.addLayer({
    id: 'flight-routes',
    type: 'line',
    source: 'flight-routes',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#D3D3D3',
      'line-width': 2,
      'line-opacity': 0.15,
    },
  });

  return routes;
}
