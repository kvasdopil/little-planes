import { Canvas } from '@react-three/fiber';
import { Camera } from './components/Camera';
import './App.css';
import { Stars } from './components/Stars';
import { useState, useCallback } from 'react';
import { Cities } from './components/Cities';
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
    startLat: 40.4168, // Madrid
    startLon: -3.7038,
    endLat: 59.9343, // St. Petersburg
    endLon: 30.3351,
  },
];

const DEFAULT_CAMERA_POSITION = {
  latitude: 50,
  longitude: 90 + 15, // FIXME: This is a hack to fix the longitude
};

export default function App() {
  const [cameraPosition, setCameraPosition] = useState(DEFAULT_CAMERA_POSITION);
  const [zoom, setZoom] = useState(3);
  const [selectedCity, setSelectedCity] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [routes] =
    useState<Array<{ startLat: number; startLon: number; endLat: number; endLon: number }>>(
      DEFAULT_ROUTES
    );

  const handleRotate = useCallback(
    (deltaLongitude: number, deltaLatitude: number) => {
      // Don't rotate the camera while creating a route
      if (selectedCity) return;

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

  const handleCityClick = (latitude: number, longitude: number) => {
    // Only handle city clicks when not creating a route
    if (!selectedCity) {
      setCameraPosition({ latitude, longitude });
      setZoom(3);
    }
  };

  const handleCityMouseDown = (latitude: number, longitude: number) => {
    setSelectedCity({ latitude, longitude });
  };

  // Handle mouse up on the globe (including cities) to end route creation
  const handleGlobeMouseUp = useCallback(() => {
    if (selectedCity) {
      // Reset route creation mode
      setSelectedCity(null);
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
        onCityClick={handleCityClick}
        onCityMouseDown={handleCityMouseDown}
        selectedCity={selectedCity}
      />

      {/* Render all routes */}
      {routes.map((route, index) => (
        <FlightPath
          key={`route-${index}`}
          startLat={route.startLat}
          startLon={route.startLon}
          endLat={route.endLat}
          endLon={route.endLon}
          maxHeight={0.08}
        />
      ))}
    </Canvas>
  );
}
