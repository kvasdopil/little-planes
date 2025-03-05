import { Canvas } from '@react-three/fiber';
import { Planet } from './components/Planet';
import { Camera } from './components/Camera';
import './App.css';
import { Stars } from './components/Stars';
import { useState, useCallback } from 'react';
import { Cities } from './components/Cities';
import { WheelEvent } from 'react';
import { GlobeControls } from './components/GlobeControls';

const MIN_ZOOM = 2.2;
const MAX_ZOOM = 10;
const ZOOM_SPEED = 0.001;

export default function App() {
  const [cameraPosition, setCameraPosition] = useState({
    latitude: 50,
    longitude: 15,
  });
  const [zoom, setZoom] = useState(3);

  const handleRotate = useCallback((deltaLongitude: number, deltaLatitude: number) => {
    setCameraPosition((prev) => {
      // Calculate new positions
      const newLongitude = prev.longitude - deltaLongitude;
      // Clamp latitude between -85 and 85 degrees
      const newLatitude = Math.min(85, Math.max(-85, prev.latitude - deltaLatitude));

      return {
        latitude: newLatitude,
        longitude: newLongitude,
      };
    });
  }, []);

  const handleCityClick = (latitude: number, longitude: number) => {
    setCameraPosition({ latitude, longitude });
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
      <Planet sunRotationSpeed={-0.2}>
        <Cities onCityClick={handleCityClick} />
      </Planet>
    </Canvas>
  );
}
