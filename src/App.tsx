import { Canvas } from '@react-three/fiber';
import { Globe } from './components/Globe';
import './App.css';

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 6] }}>
      <ambientLight>
        <ambientLight intensity={0.5} />
      </ambientLight>
      <Globe />
    </Canvas>
  );
}
