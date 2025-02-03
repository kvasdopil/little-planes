import { Map } from 'maplibre-gl';
import { airports } from '../airportsData';
import { dailyFlights } from '../flightData';
import { RouteFeature } from '../types/mapTypes';
import { createGeodesicLine } from '../utils/mapUtils';

export function createFlightRoutes(map: Map): RouteFeature[] {
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