import { Matrix4, Vector3, Mesh, MeshBasicMaterial } from 'three';
import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CityModel } from './Cities';
import { createFlightCurve } from '../utils/flightCurve';
import { useFBX } from '@react-three/drei';

interface AirplaneProps {
  startCity: CityModel;
  endCity: CityModel;
  maxHeight: number;
  speed?: number;
}

const EARTH_RADIUS = 2;

// Pre-create rotation matrix for the cone
const rotationX = new Matrix4().makeRotationX(-Math.PI / 2);
const originVector = new Vector3(0, 0, 0);

export function Airplane({ startCity, endCity, maxHeight, speed = 0.05 }: AirplaneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef<number>(0);
  const [direction, setDirection] = useState<number>(1);

  // Create the curve once when props change
  const curve = useMemo(
    () => createFlightCurve(startCity, endCity, maxHeight, EARTH_RADIUS),
    [startCity, endCity, maxHeight]
  );

  // set aircraft speed based on distance between start and end city
  const distance = curve.getLength();

  // Update position and rotation on each frame
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Update progress using the delta time between frames
      progressRef.current += (direction * (delta * speed)) / distance;
      if (progressRef.current > 1) {
        setDirection(-1);
        progressRef.current = 1;
      }
      if (progressRef.current < 0) {
        setDirection(1);
        progressRef.current = 0;
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
      groupRef.current.position.copy(pos);
      groupRef.current.rotation.setFromRotationMatrix(matrix);
    }
  });

  // Pre-load the model and clone it for this instance
  const originalModel = useFBX('./models/lp-airplane.fbx');

  // Create a cloned model instance for each Airplane component
  const airplaneModel = useMemo(() => {
    // Clone the original model to create a unique instance
    const clonedModel = originalModel.clone();

    // Create a standard material
    const standardMaterial = new MeshBasicMaterial({ color: 0xdddddd });

    // Apply the material to all mesh children
    clonedModel.traverse((child) => {
      // Properly check if the child is a Mesh before setting material
      if (child instanceof Mesh) {
        child.material = standardMaterial;
      }
    });

    return clonedModel;
  }, [originalModel]);

  if (!airplaneModel) {
    return null;
  }

  const isForward = direction === 1;

  return (
    <group ref={groupRef}>
      <primitive
        // eslint-disable-next-line react/no-unknown-property
        object={airplaneModel}
        scale={0.00002}
        rotation={[Math.PI / 2, isForward ? Math.PI : 0, 0]}
      />
    </group>
  );
}
