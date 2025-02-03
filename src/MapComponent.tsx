import { useEffect, useRef } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { airports } from './airportsData';
import { faPlane } from '@fortawesome/free-solid-svg-icons';
import { RouteFeature } from './types/mapTypes';
import { createMarker } from './components/AirportMarker';
import { createFlightRoutes } from './components/FlightRoutes';
import { animateAirplane } from './components/AirplaneAnimation';

function MapComponent() {
  const mapRef = useRef<Map | null>(null);
  const intervalRef = useRef<number | null>(null);
  const routesRef = useRef<RouteFeature[]>([]);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json',
      center: [18.6435, 60.1282],
      zoom: 5,
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
          sdf: true,
        });

        const routes = createFlightRoutes(map);
        routesRef.current = routes;
        airports.forEach((airport) => createMarker(airport, map));

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

      airplane.src =
        'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
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
          layers.forEach((layer) => {
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
