import { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';

interface CityProps {
  position?: [number, number, number];
  isSelected?: boolean;
  onSelect?: () => void;
  name?: string;
}

export const City = ({ position = [0, 0, 0], isSelected = false, onSelect, name }: CityProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const { scale } = useSpring({
    scale: isHovered ? 1.2 : 1,
    config: { tension: 300, friction: 10 }
  });

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
      <animated.mesh
        scale={scale}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        userData={{ cursor: 'auto' }}
      >
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial
          color={isSelected ? 'yellow' : 'white'}
        />
      </animated.mesh>
      {name && (
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="top"
        >
          {name}
        </Text>
      )}
    </group>
  );
}; 