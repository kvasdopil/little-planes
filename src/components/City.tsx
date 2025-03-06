import { Sphere } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { useState, ReactNode } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { ConstantSizeElement } from './ConstantSizeElement';

interface CityProps {
  name: string;
  latitude: number;
  longitude: number;
  size: number;
  onMouseDown: () => void;
  onMouseUp: () => void;
  isSelected: boolean;
  children?: ReactNode;
}

export function City({
  latitude,
  longitude,
  size,
  onMouseDown,
  onMouseUp,
  isSelected,
  children,
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

  return (
    <ConstantSizeElement
      latitude={latitude}
      longitude={longitude}
      minDistance={2.2}
      maxDistance={10}
      scaleFactor={0.7}
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
    </ConstantSizeElement>
  );
}
