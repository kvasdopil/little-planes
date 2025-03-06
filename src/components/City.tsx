import { Sphere } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { useState, ReactNode } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { ScaleWithCamera } from './ScaleWithCamera';

// Earth radius in whatever units the scene is using
const EARTH_RADIUS = 2;

interface CityProps {
  name: string;
  latitude: number;
  longitude: number;
  size: number;
  onMouseDown: () => void;
  onMouseUp: () => void;
  isSelected: boolean;
  children?: ReactNode;
  elevation?: number;
  minDistance?: number;
  maxDistance?: number;
  scaleFactor?: number;
}

export function City({
  latitude,
  longitude,
  size,
  onMouseDown,
  onMouseUp,
  isSelected,
  children,
  elevation = 0,
  minDistance = 2.2,
  maxDistance = 10,
  scaleFactor = 0.7,
}: CityProps) {
  const [hovered, setHovered] = useState(false);

  const springs = useSpring({
    scale: hovered ? 1.3 : 1,
    config: { mass: 2, tension: 400, friction: 30 },
  });

  const handleMouseDown = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onMouseDown();
  };

  const handleMouseUp = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onMouseUp();
  };

  // Determine the color based on selection state
  const cityColor = isSelected ? 'yellow' : 'white';

  // Calculate position on the globe (from ConstantSizeElement)
  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;
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
            <animated.mesh
              scale={springs.scale}
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
              onPointerDown={handleMouseDown}
              onPointerUp={handleMouseUp}
            >
              <Sphere args={[size, 16, 16]}>
                <meshBasicMaterial color={cityColor} />
              </Sphere>
            </animated.mesh>
            {children}
          </ScaleWithCamera>
        </group>
      </group>
    </group>
  );
}
