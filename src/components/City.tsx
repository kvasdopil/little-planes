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
  onClick: (latitude: number, longitude: number) => void;
  children?: ReactNode;
}

export function City({ latitude, longitude, size, onClick, children }: CityProps) {
  const [hovered, setHovered] = useState(false);

  const springs = useSpring({
    scale: hovered ? 1.3 : 1,
    config: { mass: 2, tension: 400, friction: 30 },
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onClick(latitude, longitude + 90); // FIXME: This is a hack to fix the longitude
  };

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
        onClick={handleClick}
      >
        <Sphere args={[size, 16, 16]}>
          <meshBasicMaterial color="white" />
        </Sphere>
      </animated.mesh>
      {children}
    </ConstantSizeElement>
  );
}
