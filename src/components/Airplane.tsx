import { Matrix4, Vector3, MeshStandardMaterial, Mesh } from 'three';
import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CityModel } from './Cities';
import { createFlightCurve } from '../utils/flightCurve';
import { useFBX } from '@react-three/drei';
import { AirplaneParticles } from './AirplaneParticles';

interface AirplaneProps {
  startCity: CityModel;
  endCity: CityModel;
  maxHeight: number;
  speed?: number;
  color?: string; // Added color prop for customization
}

const EARTH_RADIUS = 2;

// Pre-create rotation matrix for the cone
const rotationX = new Matrix4().makeRotationX(-Math.PI / 2);
const originVector = new Vector3(0, 0, 0);

export function Airplane({
  startCity,
  endCity,
  maxHeight,
  speed = 0.05,
  color = '#ffffff',
}: AirplaneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const emitterLeft = useRef<THREE.Group>(null);
  const emitterRight = useRef<THREE.Group>(null);
  const progressRef = useRef<number>(0);
  const [direction, setDirection] = useState<number>(1);
  // Keep track of current tangent for particle direction
  const currentTangent = useRef<Vector3>(new Vector3());

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
      // Store the current tangent for particle emission
      currentTangent.current = tangent;

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

    // Create a standard material with the specified color
    const standardMaterial = new MeshStandardMaterial({
      color: color,
      metalness: 0.6,
      roughness: 0.2,
    });

    // Apply the material to all mesh children
    clonedModel.traverse((child) => {
      // Properly check if the child is a Mesh before setting material
      if (child instanceof Mesh) {
        child.material = standardMaterial;
      }
    });

    return clonedModel;
  }, [originalModel, color]);

  if (!airplaneModel) {
    return null;
  }

  const isForward = direction === 1;

  return (
    <group>
      <group ref={groupRef}>
        <primitive
          // eslint-disable-next-line react/no-unknown-property
          object={airplaneModel}
          scale={0.00002}
          rotation={[Math.PI / 2, isForward ? Math.PI : 0, 0]}
        />
        {/* Position emitters at the wing tips of the airplane for visible particle trails */}
        <group ref={emitterLeft} position={[0.01, isForward ? -0.02 : 0.02, 0]}></group>
        <group ref={emitterRight} position={[-0.01, isForward ? -0.02 : 0.02, 0]}></group>
      </group>

      {/* Add the particle systems */}
      <AirplaneParticles
        groupRef={emitterLeft}
        color={color}
        maxParticles={100}
        emissionRate={2}
        particleLifespan={6}
        size={0.005}
      />

      <AirplaneParticles
        groupRef={emitterRight}
        color={color}
        maxParticles={100}
        emissionRate={2}
        particleLifespan={6}
        size={0.005}
      />
    </group>
  );
}
