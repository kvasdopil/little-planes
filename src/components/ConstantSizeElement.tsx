import { ReactNode } from 'react';
import { ScaleWithCamera } from './ScaleWithCamera';

interface ConstantSizeElementProps {
  latitude: number;
  longitude: number;
  elevation?: number;
  children: ReactNode;
  minDistance?: number;
  maxDistance?: number;
  scaleFactor?: number;
}

const EARTH_RADIUS = 2;

/**
 * A component that places an element at a geographic position on the globe
 * and maintains its size regardless of camera zoom level.
 */
export function ConstantSizeElement({
  latitude,
  longitude,
  elevation = 0,
  children,
  minDistance = 2.2,
  maxDistance = 10,
  scaleFactor = 0.7,
}: ConstantSizeElementProps) {
  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;

  // Calculate the position on the globe surface plus elevation
  const radius = EARTH_RADIUS + elevation;

  return (
    <group rotation={[0, lonRad, latRad]}>
      <group rotation={[0, Math.PI / 2, 0]}>
        <group position={[0, 0, radius]}>
          <ScaleWithCamera
            minDistance={minDistance}
            maxDistance={maxDistance}
            scaleFactor={scaleFactor}
          >
            {children}
          </ScaleWithCamera>
        </group>
      </group>
    </group>
  );
}
