import { useRef, useState } from 'react';
import { Vector3, BufferGeometry, Float32BufferAttribute } from 'three';
import { useFrame } from '@react-three/fiber';

interface PlaneProps {
  start: Vector3;
  end: Vector3;
  speed?: number;
  onReachDestination?: () => void;
}

// Create triangle geometry
const triangleGeometry = new BufferGeometry();
const vertices = new Float32Array([
  0.0,
  -0.05,
  0, // bottom
  0.05,
  0.05,
  0, // top right
  -0.05,
  0.05,
  0, // top left
]);
triangleGeometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));

export const Plane = ({ start, end, speed = 1, onReachDestination }: PlaneProps) => {
  const [position, setPosition] = useState(() => start.clone());
  const progressRef = useRef(0);
  const hasReachedEndRef = useRef(false);
  const direction = end.clone().sub(start).normalize();

  useFrame((_, delta) => {
    if (hasReachedEndRef.current) return;

    progressRef.current += speed * delta;

    if (progressRef.current >= 1) {
      progressRef.current = 1;
      hasReachedEndRef.current = true;
      onReachDestination?.();
    }

    const newPosition = start.clone().lerp(end, progressRef.current);
    setPosition(newPosition);
  });

  // Calculate rotation to face movement direction
  const angle = Math.atan2(direction.y, direction.x) + Math.PI / 2;

  return (
    <mesh position={position} rotation={[0, 0, angle]} geometry={triangleGeometry}>
      <meshBasicMaterial color="yellow" />
    </mesh>
  );
};
