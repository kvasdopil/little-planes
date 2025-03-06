import { Matrix4, Vector3 } from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CityModel } from './Cities';
import { createFlightCurve } from '../utils/flightCurve';

interface AirplaneProps {
  startCity: CityModel;
  endCity: CityModel;
  maxHeight: number;
  speed?: number;
}

const EARTH_RADIUS = 2;
const CONE_LENGTH = 0.04;
const CONE_RADIUS = 0.01;

// Pre-create rotation matrix for the cone
const rotationX = new Matrix4().makeRotationX(-Math.PI / 2);
const originVector = new Vector3(0, 0, 0);

export function Airplane({ startCity, endCity, maxHeight, speed = 0.05 }: AirplaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef<number>(0);
  const direction = useRef<number>(1);

  // Create the curve once when props change
  const curve = useMemo(
    () => createFlightCurve(startCity, endCity, maxHeight, EARTH_RADIUS),
    [startCity, endCity, maxHeight]
  );

  // set aircraft speed based on distance between start and end city
  const distance = curve.getLength();

  // Update position and rotation on each frame
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Update progress using the delta time between frames
      progressRef.current += (direction.current * (delta * speed)) / distance;
      if (progressRef.current > 1) {
        direction.current = -1;
      }
      if (progressRef.current < 0) {
        direction.current = 1;
      }

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
