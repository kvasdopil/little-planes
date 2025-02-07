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
  onDragStart?: (cityId: CityId) => void;
  onDragOver?: (cityId: CityId) => void;
  onDragEnd?: (cityId: CityId | null) => void;
  isDraggingActive?: boolean;
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

export const City = ({ 
  position = [0, 0, 0], 
  isSelected = false, 
  onSelect, 
  name, 
  id,
  size = 'small',
  onDragStart,
  onDragOver,
  onDragEnd,
  isDraggingActive = false
}: CityProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const { scale } = useSpring({
    scale: isHovered ? 1.2 : 1,
    config: { tension: 300, friction: 10 }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!hasMoved) {
      event.stopPropagation();
      onSelect?.();
    }
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    setIsDragging(true);
    setHasMoved(false);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    event.stopPropagation();
    onDragStart?.(id);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (isDragging) {
      event.stopPropagation();
      setHasMoved(true);
    }
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    
    if (isDragging && hasMoved) {
      onDragEnd?.(null);
    } else if (isHovered && isDraggingActive && !isDragging) {
      onDragOver?.(id);
    } else if (!hasMoved) {
      onSelect?.();
    }
    
    setIsDragging(false);
    setHasMoved(false);
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    setIsHovered(true);
    if (isDraggingActive && !isDragging) {
      onDragOver?.(id);
    }
    (event.object as Mesh).userData.cursor = 'pointer';
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    setIsHovered(false);
    (event.object as Mesh).userData.cursor = 'auto';
  };

  return (
    <group position={position}>
      <animated.mesh
        scale={scale}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        userData={{ cursor: 'auto' }}
      >
        <circleGeometry args={[CITY_SIZES[size].radius, 32]} />
        <meshBasicMaterial
          color={isSelected ? 'yellow' : 'white'}
        />
      </animated.mesh>
      {name && (
        <Text
          position={[0, CITY_SIZES[size].textOffset, 0]}
          fontSize={CITY_SIZES[size].fontSize}
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