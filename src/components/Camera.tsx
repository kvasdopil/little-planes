import { useRef, useEffect } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { Group, PerspectiveCamera as ThreePerspectiveCamera } from 'three';
import { geoToCartesian } from '../utils/coordinates';

interface CameraProps {
  latitude: number;
  longitude: number;
  distance: number;
  fov: number;
}

export function Camera({ latitude, longitude, distance, fov }: CameraProps) {
  const pivotRef = useRef<Group>(null);
  const cameraRef = useRef<ThreePerspectiveCamera>(null);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, []);

  const position = geoToCartesian(latitude, longitude, distance);

  return (
    <group ref={pivotRef}>
      <PerspectiveCamera ref={cameraRef} makeDefault position={position} fov={fov} />
    </group>
  );
}
