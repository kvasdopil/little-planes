import { useRef, useEffect } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { Group, PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from 'three';

interface CameraProps {
  latitude: number;
  longitude: number;
  distance: number;
  fov: number;
}

function geoToCartesian(latitude: number, longitude: number, distance: number): Vector3 {
  // Convert degrees to radians
  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;

  // Calculate position
  const x = distance * Math.cos(latRad) * Math.cos(lonRad);
  const y = distance * Math.sin(latRad);
  const z = distance * Math.cos(latRad) * Math.sin(lonRad);

  return new Vector3(x, y, z);
}

export function Camera({
  latitude,
  longitude,
  distance,
  fov
}: CameraProps) {
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