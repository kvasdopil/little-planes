import { useRef } from 'react';
import { Vector3, BufferGeometry, Float32BufferAttribute } from 'three';
import { useFrame } from '@react-three/fiber';
import { AirplaneModel } from '../../types/city';
import * as THREE from 'three';

interface PlaneProps {
  start: Vector3;
  end: Vector3;
  speed?: number;
  onReachDestination?: () => void;
  model: AirplaneModel;
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

export const Plane = ({ start, end, speed = 1, onReachDestination, model }: PlaneProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);
  const hasReachedEndRef = useRef(false);
  const direction = end.clone().sub(start).normalize();
  const totalDistance = end.clone().sub(start).length();

  // Adjust color based on model
  const color = model === 'Bingo Buzzer' ? 'yellow' : 'orange';

  useFrame((_, delta) => {
    if (hasReachedEndRef.current || !meshRef.current) return;

    // Calculate distance to move this frame based on speed and delta time
    const distanceThisFrame = speed * delta;
    progressRef.current += distanceThisFrame / totalDistance;

    if (progressRef.current >= 1) {
      progressRef.current = 1;
      hasReachedEndRef.current = true;
      onReachDestination?.();
    }

    // Update position directly without useState
    meshRef.current.position.copy(start.clone().lerp(end, progressRef.current));
  });

  // Calculate rotation to face movement direction
  const angle = Math.atan2(direction.y, direction.x) + Math.PI / 2;

  return (
    <mesh ref={meshRef} rotation={[0, 0, angle]} geometry={triangleGeometry}>
      <meshBasicMaterial color={color} />
    </mesh>
  );
};
