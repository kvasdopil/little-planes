import React from 'react';
import { Vector3, BufferGeometry, Float32BufferAttribute, Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { AirplaneModel } from '../../types/city';

interface PlaneProps {
  start: Vector3;
  end: Vector3;
  model: AirplaneModel;
  startTime: number;
  speed: number;
}

// Create triangle geometry to represent the plane
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

const Plane: React.FC<PlaneProps> = ({ start, end, model, startTime, speed }) => {
  const meshRef = React.useRef<Mesh>(null);
  const totalDistance = end.clone().sub(start).length();
  const flightDuration = (totalDistance / speed) * 1000;

  useFrame(() => {
    if (meshRef.current) {
      const progress = Math.min((performance.now() - startTime) / flightDuration, 1);
      const position = start.clone().lerp(end, progress);
      meshRef.current.position.copy(position);
    }
  });

  // Determine the flight's rotation so that the plane faces its movement direction
  const direction = end.clone().sub(start).normalize();
  const angle = Math.atan2(direction.y, direction.x) + Math.PI / 2;
  // Choose color based on the airplane model
  const color = model === 'Bingo Buzzer' ? 'yellow' : 'orange';

  return (
    <mesh ref={meshRef} rotation={[0, 0, angle]} geometry={triangleGeometry}>
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

export default Plane;
