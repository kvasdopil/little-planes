import { Canvas } from '@react-three/fiber';
import { Camera } from './components/Camera';
import './App.css';
import { Stars } from './components/Stars';
import { useState, useCallback } from 'react';
import { Cities } from './components/Cities';
import { WheelEvent } from 'react';
import { GlobeControls } from './components/GlobeControls';
import { Globe } from './components/Globe';

const MIN_ZOOM = 2.2;
const MAX_ZOOM = 10;
const ZOOM_SPEED = 0.001;

export default function App() {
  const [cameraPosition, setCameraPosition] = useState({
    latitude: 50,
    longitude: 90 + 15, // FIXME: This is a hack to fix the longitude
  });
  const [zoom, setZoom] = useState(3);

  const handleRotate = useCallback((deltaLongitude: number, deltaLatitude: number) => {
    setCameraPosition((prev) => {
      // Calculate new longitude by subtracting delta (moving in opposite direction of drag)
      const newLongitude = prev.longitude - deltaLongitude;

      // Normalize longitude to stay within -180 to 180 range
      const normalizedLongitude = ((newLongitude + 180) % 360) - 180;

      // Apply latitude changes and clamp between -85 and 85 degrees
      const newLatitude = Math.min(85, Math.max(-85, prev.latitude - deltaLatitude));

      return {
        latitude: newLatitude,
        longitude: normalizedLongitude,
      };
    });
  }, []);

  const handleCityClick = (latitude: number, longitude: number) => {
    setCameraPosition({ latitude, longitude });
    setZoom(3);
  };

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      const delta = event.deltaY;
      // Use square root of current zoom to make changes more gradual at higher zoom levels
      const scaleFactor = Math.sqrt(zoom) * ZOOM_SPEED;
      const newZoom = zoom + delta * scaleFactor;

      // Clamp the zoom value between MIN_ZOOM and MAX_ZOOM
      setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom)));
    },
    [zoom]
  );

  return (
    <Canvas onWheel={handleWheel}>
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
      <Cities onCityClick={handleCityClick} />
    </Canvas>
  );
}
