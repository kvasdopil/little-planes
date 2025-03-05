import { useRef, useEffect } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { Group, PerspectiveCamera as ThreePerspectiveCamera } from 'three';

interface CameraControllerProps {
  distance?: number;
  height?: number;
  fov?: number;
}

export function CameraController({
  distance = 6,
  height = 2,
  fov = 75,
}: CameraControllerProps = {}) {
  const pivotRef = useRef<Group>(null);
  const cameraRef = useRef<ThreePerspectiveCamera>(null);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, []);

  return (
    <group ref={pivotRef}>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[distance, height, 0]} fov={fov} />
    </group>
  );
}
