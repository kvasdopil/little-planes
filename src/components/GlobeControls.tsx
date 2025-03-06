import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

interface GlobeControlsProps {
  onRotate: (
    deltaLongitude: number,
    deltaLatitude: number,
    currentPosition?: { latitude: number; longitude: number }
  ) => void;
  radius?: number;
  visible?: boolean;
}

/**
 * Globe controls component that handles rotation via raycasting
 * Provides camera control by dragging to rotate the globe view
 * Uses absolute coordinates for stable camera movement
 */
export function GlobeControls({ onRotate, radius = 2, visible = false }: GlobeControlsProps) {
  const { raycaster, camera, size } = useThree();
  const sphereRef = useRef<THREE.Mesh>(null);
  const currentPositionRef = useRef<{ longitude: number; latitude: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (!sphereRef.current) return;

      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(sphereRef.current);

      if (intersects.length > 0) {
        isDraggingRef.current = true;
        const point = intersects[0].point;

        // Calculate absolute longitude and latitude (in degrees)
        const longitude = (Math.atan2(point.x, point.z) * 180) / Math.PI;
        const latitude = (Math.asin(point.y / radius) * 180) / Math.PI;

        currentPositionRef.current = { longitude, latitude };
      }
    },
    [raycaster, camera, size, radius]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!sphereRef.current) return;

      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(sphereRef.current);

      if (intersects.length > 0) {
        const point = intersects[0].point;

        // Calculate current absolute coordinates (in degrees)
        const longitude = (Math.atan2(point.x, point.z) * 180) / Math.PI;
        const latitude = (Math.asin(point.y / radius) * 180) / Math.PI;
        const currentPosition = { latitude, longitude };

        // If we're dragging, handle rotation
        if (isDraggingRef.current && currentPositionRef.current) {
          // Calculate the deltas (differences) from previous position
          const deltaLongitude = longitude - currentPositionRef.current.longitude;
          const deltaLatitude = latitude - currentPositionRef.current.latitude;

          // Update the current position reference
          currentPositionRef.current = currentPosition;

          // Pass the deltas and current position to the rotation handler
          onRotate(deltaLongitude, deltaLatitude, currentPosition);
        } else {
          // If not dragging, just pass the current position with no rotation
          onRotate(0, 0, currentPosition);
        }
      }
    },
    [raycaster, camera, size, onRotate, radius]
  );

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    currentPositionRef.current = null;
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
