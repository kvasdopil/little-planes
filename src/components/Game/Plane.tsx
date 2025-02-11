import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Vector3, BufferGeometry, Float32BufferAttribute } from 'three';
import { useFrame } from '@react-three/fiber';
import { AirplaneModel } from '../../types/city';

interface PlaneProps {
  start: Vector3;
  end: Vector3;
  speed?: number;
  onReachDestination?: () => void;
  model: AirplaneModel;
}

// Create triangle geometry to represent the plane
const triangleGeometry = new BufferGeometry();
const vertices = new Float32Array([
  0.0, -0.05, 0, // bottom
  0.05, 0.05, 0, // top right
  -0.05, 0.05, 0, // top left
]);
triangleGeometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));

const Plane: React.FC<PlaneProps> = ({ start, end, speed = 1, onReachDestination, model }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  // Store the flight start time
  const startTimeRef = useRef<number>(0);
  const totalDistance = end.clone().sub(start).length();
  // Compute the total flight duration in ms from distance and speed
  const flightDuration = (totalDistance / speed) * 1000;

  // Presentation-level logic: update the mesh's position on every frame using useFrame.
  useFrame(() => {
    if (meshRef.current) {
      const progress = Math.min((performance.now() - startTimeRef.current) / flightDuration, 1);
      meshRef.current.position.copy(start.clone().lerp(end, progress));
    }
  });

  // Separate async function to detect when the flight is finished (using timestamps only)
  useEffect(() => {
    startTimeRef.current = performance.now();
    let cancelled = false;

    const startFlight = async () => {
      while (!cancelled) {
        const progress = Math.min((performance.now() - startTimeRef.current) / flightDuration, 1);

        if (progress >= 1) {
          onReachDestination?.();
          break;
        }
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    };

    startFlight();
    return () => {
      cancelled = true;
    };
  }, [start, end, speed, onReachDestination, totalDistance, flightDuration]);

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
