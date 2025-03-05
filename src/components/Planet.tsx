import { ReactNode } from 'react';
import { Globe } from './Globe';
import { Cities } from './Cities';

interface PlanetProps {
  children?: ReactNode;
  sunRotationSpeed: number;
  onCityClick: (latitude: number, longitude: number) => void;
}

export const Planet = ({ children, sunRotationSpeed, onCityClick }: PlanetProps) => {
  return (
    <group>
      <Globe rotationSpeed={sunRotationSpeed} />
      <Cities onCityClick={onCityClick} />
      {children}
    </group>
  );
};
