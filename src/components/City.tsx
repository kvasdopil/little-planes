import { Sphere } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { geoToCartesian } from '../utils/coordinates';
import { useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';

interface CityProps {
  name: string;
  latitude: number;
  longitude: number;
  size: number;
  onClick: (latitude: number, longitude: number) => void;
}

const EARTH_RADIUS = 2;

export function City({ latitude, longitude, size, onClick }: CityProps) {
  const position = geoToCartesian(latitude, longitude, EARTH_RADIUS);
  const [hovered, setHovered] = useState(false);

  const springs = useSpring({
    scale: hovered ? 1.3 : 1,
    config: { mass: 2, tension: 400, friction: 30 },
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onClick(latitude, longitude);
  };

  return (
    <group position={position}>
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
    </group>
  );
}
