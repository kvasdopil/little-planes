import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

interface GlobeControlsProps {
  onRotate: (deltaLongitude: number, deltaLatitude: number) => void;
  radius?: number;
  visible?: boolean;
}

/**
 * Globe controls component that handles rotation via raycasting
 * Provides camera control by dragging to rotate the globe view
 */
export function GlobeControls({ onRotate, radius = 2, visible = false }: GlobeControlsProps) {
  const { raycaster, camera, size } = useThree();
  const sphereRef = useRef<THREE.Mesh>(null);
  const initialIntersectionRef = useRef<THREE.Vector3 | null>(null);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (!sphereRef.current) return;

      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(sphereRef.current);

      if (intersects.length > 0) {
        initialIntersectionRef.current = intersects[0].point;
      }
    },
    [raycaster, camera, size]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!sphereRef.current || !(event.buttons & 1) || !initialIntersectionRef.current) return;

      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(sphereRef.current);

      if (intersects.length > 0) {
        const currentPoint = intersects[0].point;

        // Calculate longitude change (horizontal rotation)
        const initialLongitude = Math.atan2(
          initialIntersectionRef.current.x,
          initialIntersectionRef.current.z
        );
        const currentLongitude = Math.atan2(currentPoint.x, currentPoint.z);
        const deltaLongitude = ((currentLongitude - initialLongitude) * 180) / Math.PI;

        // Calculate latitude change (vertical rotation)
        const initialLatitude =
          (Math.asin(initialIntersectionRef.current.y / radius) * 180) / Math.PI;
        const currentLatitude = (Math.asin(currentPoint.y / radius) * 180) / Math.PI;
        const deltaLatitude = currentLatitude - initialLatitude;

        onRotate(deltaLongitude, deltaLatitude);
      }
    },
    [raycaster, camera, size, onRotate, radius]
  );

  const handlePointerUp = useCallback(() => {
    initialIntersectionRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial transparent opacity={visible ? 0.2 : 0} />
    </mesh>
  );
}
