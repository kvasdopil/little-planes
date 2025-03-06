import { ReactNode, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Vector3 } from 'three';

interface ScaleWithCameraProps {
  children: ReactNode;
  minDistance: number;
  maxDistance: number;
  scaleFactor: number;
}

/**
 * A component that scales its children according to camera distance
 * to maintain a constant angular size regardless of zoom level.
 */
export function ScaleWithCamera({
  children,
  minDistance,
  maxDistance,
  scaleFactor,
}: ScaleWithCameraProps) {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();
  const objPos = useRef(new Vector3());

  useFrame(() => {
    if (!groupRef.current) return;

    // Get position of the object in world space
    const pos = groupRef.current.getWorldPosition(objPos.current);

    // Calculate distance from camera to this object
    const distanceToCamera = camera.getWorldPosition(pos).length();

    // Apply scale with limits for stability
    const distance = Math.max(minDistance, Math.min(maxDistance, distanceToCamera));
    const scale = (distance / minDistance) * scaleFactor;

    // Apply scale to maintain constant angular size
    groupRef.current.scale.set(scale, scale, scale);
  });

  return <group ref={groupRef}>{children}</group>;
}
