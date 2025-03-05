import { ReactNode } from 'react';
import { Globe } from './Globe';
import { Cities } from './Cities';

interface PlanetProps {
  children?: ReactNode;
  rotationSpeed: number;
  position: [number, number, number];
  scale: number;
}

export const Planet = ({ children, rotationSpeed, position, scale }: PlanetProps) => {
  return (
    <group position={position} scale={scale}>
      <Globe rotationSpeed={rotationSpeed} />
      <Cities />
      {children}
    </group>
  );
};
