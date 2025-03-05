import { ReactNode } from 'react';
import { Globe } from './Globe';

interface PlanetProps {
  children?: ReactNode;
  sunRotationSpeed: number;
}

export const Planet = ({ children, sunRotationSpeed }: PlanetProps) => {
  return (
    <group>
      <Globe rotationSpeed={sunRotationSpeed} />
      {children}
    </group>
  );
};
