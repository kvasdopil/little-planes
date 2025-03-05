import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Planet } from './components/Planet';
import { CameraController } from './components/CameraController';
import './App.css';

export default function App() {
  return (
    <Canvas>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <color attach="background" args={['#000']} />
      <CameraController />
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <Planet rotationSpeed={0.1} />
    </Canvas>
  );
}
