import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Planet } from './components/Planet';
import { CameraController } from './components/CameraController';
import './App.css';
import { Stars } from './components/Stars';

export default function App() {
  return (
    <Canvas>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <color attach="background" args={['#000']} />
      <Stars count={5000} radius={50} />
      <CameraController />
      <OrbitControls
        minDistance={3}
        maxDistance={10}
        zoomSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
      />
      <Planet rotationSpeed={-0.2} />
    </Canvas>
  );
}
