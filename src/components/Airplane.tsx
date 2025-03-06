import { Matrix4, Vector3 } from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CityModel } from './Cities';
import { createFlightCurve } from '../utils/flightCurve';

interface AirplaneProps {
  startCity: CityModel;
  endCity: CityModel;
  maxHeight: number;
}

const EARTH_RADIUS = 2;
const CONE_LENGTH = 0.04;
const CONE_RADIUS = 0.01;
const ANIMATION_SPEED = 0.05; // Controls the speed of airplane movement

// Pre-create rotation matrix for the cone
const rotationX = new Matrix4().makeRotationX(-Math.PI / 2);
const originVector = new Vector3(0, 0, 0);

export function Airplane({ startCity, endCity, maxHeight }: AirplaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef<number>(Math.random()); // Start at random position

  // Create the curve once when props change
  const curve = useMemo(
    () => createFlightCurve(startCity, endCity, maxHeight, EARTH_RADIUS),
    [startCity, endCity, maxHeight]
  );

  // Update position and rotation on each frame
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Update progress using the delta time between frames
      progressRef.current += ANIMATION_SPEED * delta;
      if (progressRef.current > 1) progressRef.current = 0;

      // Get point at current progress
      const pos = curve.getPointAt(progressRef.current);

      // Get the tangent at this point (direction of travel)
      const tangent = curve.getTangentAt(progressRef.current);

      // Calculate the up vector (pointing away from Earth's center)
      const up = pos.clone().normalize();

      // Create rotation matrix that orients the cone along the path
      const matrix = new Matrix4().lookAt(originVector, tangent, up).multiply(rotationX);

      // Update the mesh position and rotation
      meshRef.current.position.copy(pos);
      meshRef.current.rotation.setFromRotationMatrix(matrix);
    }
  });

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[CONE_RADIUS, CONE_LENGTH, 8]} />
      <meshBasicMaterial color="white" />
    </mesh>
  );
}
