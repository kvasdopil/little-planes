import { ReactNode } from 'react';
import { Globe } from './Globe';

interface PlanetProps {
  children?: ReactNode;
  rotationSpeed?: number;
  position?: [number, number, number];
  scale?: number;
}

export const Planet = ({ 
  children,
  rotationSpeed,
  position = [0, 0, 0],
  scale = 1,
}: PlanetProps) => {
  return (
    <group position={position} scale={scale}>
      <Globe 
        rotationSpeed={rotationSpeed}
      />
      {children}
    </group>
  );
}; 