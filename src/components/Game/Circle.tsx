import { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Mesh } from 'three';

interface CircleProps {
  position?: [number, number, number];
  isSelected?: boolean;
  onSelect?: () => void;
}

export const Circle = ({ position = [0, 0, 0], isSelected = false, onSelect }: CircleProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsHovered(true);
    (event.object as Mesh).userData.cursor = 'pointer';
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsHovered(false);
    (event.object as Mesh).userData.cursor = 'auto';
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect?.();
  };

  return (
    <group position={position}>
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        userData={{ cursor: 'auto' }}
      >
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial
          color={isSelected ? 'yellow' : 'white'}
          transparent
          opacity={isHovered ? 0.5 : 1}
        />
      </mesh>
    </group>
  );
};
