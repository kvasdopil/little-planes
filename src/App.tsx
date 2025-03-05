import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Planet } from './components/Planet';
import { Camera } from './components/Camera';
import './App.css';
import { Stars } from './components/Stars';
import { useState } from 'react';
import { Cities } from './components/Cities';

export default function App() {
  const [cameraPosition, setCameraPosition] = useState({
    latitude: 50,
    longitude: 15,
  });

  const handleCityClick = (latitude: number, longitude: number) => {
    setCameraPosition({ latitude, longitude });
  };

  return (
    <Canvas>
      <color attach="background" args={['#000']} />
      <Stars count={5000} radius={50} />
      <Camera
        latitude={cameraPosition.latitude}
        longitude={cameraPosition.longitude}
        distance={3}
        fov={55}
      />
      <OrbitControls
        minDistance={2.2}
        maxDistance={10}
        zoomSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
      />
      <Planet sunRotationSpeed={-0.2}>
        <Cities onCityClick={handleCityClick} />
      </Planet>
    </Canvas>
  );
}
