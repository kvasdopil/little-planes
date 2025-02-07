import { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import { CityId, CitySize } from '../../types/city';

interface CityProps {
  position?: [number, number, number];
  isSelected?: boolean;
  onSelect?: () => void;
  name?: string;
  id: CityId;
  size: CitySize;
}

const CITY_SIZES = {
  small: {
    radius: 0.15,
    fontSize: 0.12,
    textOffset: -0.25
  },
  big: {
    radius: 0.25,
    fontSize: 0.18,
    textOffset: -0.35
  }
};

export const City = ({ position = [0, 0, 0], isSelected = false, onSelect, name, size = 'small' }: CityProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const sizeConfig = CITY_SIZES[size];

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
        <circleGeometry args={[sizeConfig.radius, 32]} />
        <meshBasicMaterial
          color={isSelected ? 'yellow' : 'white'}
        />
      </animated.mesh>
      {name && (
        <Text
          position={[0, sizeConfig.textOffset, 0]}
          fontSize={sizeConfig.fontSize}
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