import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Group, PerspectiveCamera as ThreePerspectiveCamera } from 'three';

interface CameraControllerProps {
  distance?: number;
  height?: number;
  rotationSpeed?: number;
  fov?: number;
}

export function CameraController({
  distance = 6,
  height = 2,
  rotationSpeed = 0.1,
  fov = 75,
}: CameraControllerProps = {}) {
  const pivotRef = useRef<Group>(null);
  const cameraRef = useRef<ThreePerspectiveCamera>(null);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, []);

  useFrame(({ clock }) => {
    if (pivotRef.current) {
      // Simply rotate the pivot group
      pivotRef.current.rotation.y = clock.getElapsedTime() * -rotationSpeed; // Negative for counterclockwise
    }
  });

  return (
    <group ref={pivotRef}>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[distance, height, 0]} fov={fov} />
    </group>
  );
}
