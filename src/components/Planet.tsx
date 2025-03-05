import { ReactNode } from 'react';
import { Globe } from './Globe';
import { Cities } from './Cities';

interface PlanetProps {
  children?: ReactNode;
  sunRotationSpeed: number;
}

export const Planet = ({ children, sunRotationSpeed }: PlanetProps) => {
  return (
    <group>
      <Globe rotationSpeed={sunRotationSpeed} />
      <Cities />
      {children}
    </group>
  );
};
