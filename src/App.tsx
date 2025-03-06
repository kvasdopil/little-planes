import { Canvas } from '@react-three/fiber';
import { Camera } from './components/Camera';
import './App.css';
import { Stars } from './components/Stars';
import { useState, useCallback } from 'react';
import { Cities, CityModel } from './components/Cities';
import { WheelEvent } from 'react';
import { GlobeControls } from './components/GlobeControls';
import { Globe } from './components/Globe';
import { FlightPath } from './components/FlightPath';

const MIN_ZOOM = 2.2;
const MAX_ZOOM = 10;
const ZOOM_SPEED = 0.001;

// Default route from Madrid to St. Petersburg
const DEFAULT_ROUTES = [
  {
    startCity: { name: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
    endCity: { name: 'Saint Petersburg', latitude: 59.9343, longitude: 30.3351 },
  },
];

const DEFAULT_CAMERA_POSITION = {
  latitude: 50,
  longitude: 90 + 15, // FIXME: This is a hack to fix the longitude
};

export default function App() {
  const [cameraPosition, setCameraPosition] = useState(DEFAULT_CAMERA_POSITION);
  const [zoom, setZoom] = useState(3);
  const [selectedCity, setSelectedCity] = useState<CityModel | null>(null);
  const [routes, setRoutes] =
    useState<Array<{ startCity: CityModel; endCity: CityModel }>>(DEFAULT_ROUTES);
  const [mousePosition, setMousePosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleRotate = useCallback(
    (
      deltaLongitude: number,
      deltaLatitude: number,
      currentPosition?: { latitude: number; longitude: number }
    ) => {
      // Don't rotate the camera while creating a route
      if (selectedCity) {
        if (currentPosition) {
          setMousePosition({
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude - 90,
          });
        }
        return;
      }

      setCameraPosition((prev) => {
        // Calculate new longitude by subtracting delta (moving in opposite direction of drag)
        const newLongitude = prev.longitude - deltaLongitude;

        // Normalize longitude to stay within -180 to 180 range
        const normalizedLongitude = ((newLongitude + 180) % 360) - 180;

        // Apply latitude changes and clamp between -85 and 85 degrees
        const newLatitude = Math.min(85, Math.max(-85, prev.latitude - deltaLatitude));

        return { latitude: newLatitude, longitude: normalizedLongitude };
      });
    },
    [selectedCity]
  );

  const handleCityMouseDown = useCallback((city: CityModel) => {
    setSelectedCity(city);
  }, []);

  const createRoute = useCallback((startCity: CityModel, endCity: CityModel) => {
    setRoutes((routes) => {
      // Check if route already exists in either direction
      const isDuplicate = routes.some(
        (route) =>
          (route.startCity.name === startCity.name && route.endCity.name === endCity.name) ||
          (route.startCity.name === endCity.name && route.endCity.name === startCity.name)
      );

      // If the route already exists, don't add it
      if (isDuplicate) return routes;

      return [...routes, { startCity, endCity }];
    });
  }, []);

  const handleCityMouseUp = useCallback(
    (city: CityModel) => {
      // when releasing the mouse on the same city, we zoom in on it
      if (selectedCity === city) {
        setCameraPosition({ latitude: city.latitude, longitude: city.longitude + 90 });
        setZoom(3);
        return;
      }

      if (!selectedCity) return;

      // otherwise, we create a route
      createRoute(selectedCity, city);
    },
    [selectedCity, createRoute]
  );

  // Handle mouse up on the globe (including cities) to end route creation
  const handleGlobeMouseUp = useCallback(() => {
    if (selectedCity) {
      // Reset route creation mode
      setSelectedCity(null);
      setMousePosition(null);
    }
  }, [selectedCity]);

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      // Don't zoom while creating a route
      if (selectedCity) return;

      const delta = event.deltaY;
      // Use square root of current zoom to make changes more gradual at higher zoom levels
      const scaleFactor = Math.sqrt(zoom) * ZOOM_SPEED;
      const newZoom = zoom + delta * scaleFactor;

      // Clamp the zoom value between MIN_ZOOM and MAX_ZOOM
      setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom)));
    },
    [zoom, selectedCity]
  );

  return (
    <Canvas onWheel={handleWheel} onPointerUp={handleGlobeMouseUp}>
      <color attach="background" args={['#000']} />
      <Stars count={5000} radius={50} />
      <Camera
        latitude={cameraPosition.latitude}
        longitude={cameraPosition.longitude}
        distance={zoom}
        fov={55}
      />
      <GlobeControls onRotate={handleRotate} />
      <Globe rotationSpeed={-0.2} />
      <Cities
        onCityMouseUp={handleCityMouseUp}
        onCityMouseDown={handleCityMouseDown}
        selectedCity={selectedCity}
      />

      {/* Render all routes */}
      {routes.map((route, index) => (
        <FlightPath
          key={`route-${index}`}
          startCity={route.startCity}
          endCity={route.endCity}
          maxHeight={0.08}
        />
      ))}

      {/* Render preview route */}
      {selectedCity && mousePosition && (
        <FlightPath
          startCity={selectedCity}
          endCity={{ name: 'Mouse Position', ...mousePosition }}
          maxHeight={0.08}
        />
      )}
    </Canvas>
  );
}
