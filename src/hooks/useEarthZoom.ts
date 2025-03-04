import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { ANIMATION_CONSTANTS, EARTH_CONSTANTS, DEFAULT_CAMERA_POSITION } from '../utils/constants';
import { calculateDynamicFOV } from '../utils/animation';

interface EarthZoomProps {
  camera: THREE.PerspectiveCamera | null;
}

export interface EarthZoomResult {
  zoomStateRef: React.MutableRefObject<{
    cameraDistance: number;
    targetCameraDistance: number;
  }>;
  handleWheel: (event: WheelEvent) => void;
  updateTargetZoom: (targetZoom: number) => void;
  updateZoom: () => void;
}

/**
 * Hook for handling Earth zooming
 */
export const useEarthZoom = ({ camera }: EarthZoomProps): EarthZoomResult => {
  // Zoom state
  const zoomStateRef = useRef({
    cameraDistance: DEFAULT_CAMERA_POSITION.ZOOM,
    targetCameraDistance: DEFAULT_CAMERA_POSITION.ZOOM,
  });

  /**
   * Handle wheel event for zooming
   */
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!camera) return;

      // Get normalized wheel delta (normalize across different browsers/devices)
      const delta = -Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 50) / 50;

      // Calculate new zoom with non-linear scaling
      const currentZoom = zoomStateRef.current.targetCameraDistance;
      
      // Scale zoom speed based on current distance for better control
      const zoomSpeed = ANIMATION_CONSTANTS.ZOOM_SPEED * (currentZoom / EARTH_CONSTANTS.MAX_CAMERA_DISTANCE);
      
      // Calculate new zoom value
      let newZoom = currentZoom * Math.pow(1 + delta * zoomSpeed, 0.5);
      
      // Clamp to min/max distances
      newZoom = Math.max(
        EARTH_CONSTANTS.MIN_CAMERA_DISTANCE,
        Math.min(EARTH_CONSTANTS.MAX_CAMERA_DISTANCE, newZoom)
      );
      
      zoomStateRef.current.targetCameraDistance = newZoom;
    },
    [camera]
  );

  /**
   * Update target zoom directly
   */
  const updateTargetZoom = useCallback((targetZoom: number) => {
    // Clamp to min/max distances
    const newZoom = Math.max(
      EARTH_CONSTANTS.MIN_CAMERA_DISTANCE,
      Math.min(EARTH_CONSTANTS.MAX_CAMERA_DISTANCE, targetZoom)
    );
    
    zoomStateRef.current.targetCameraDistance = newZoom;
  }, []);

  /**
   * Update zoom based on current state
   */
  const updateZoom = useCallback(() => {
    if (!camera) return;

    const { cameraDistance, targetCameraDistance } = zoomStateRef.current;

    // Smooth zoom transition
    if (Math.abs(targetCameraDistance - cameraDistance) > 0.01) {
      const newCameraDistance =
        cameraDistance +
        (targetCameraDistance - cameraDistance) * ANIMATION_CONSTANTS.ZOOM_SMOOTHING_FACTOR;

      // Update camera position
      camera.position.z = newCameraDistance;

      // Calculate and update FOV based on distance
      const dynamicFOV = calculateDynamicFOV(
        newCameraDistance,
        EARTH_CONSTANTS.MIN_CAMERA_DISTANCE,
        EARTH_CONSTANTS.MAX_CAMERA_DISTANCE,
        EARTH_CONSTANTS.MIN_FOV,
        EARTH_CONSTANTS.MAX_FOV
      );

      if (camera.fov !== dynamicFOV) {
        camera.fov = dynamicFOV;
        camera.updateProjectionMatrix();
      }

      // Update state
      zoomStateRef.current.cameraDistance = newCameraDistance;
    }
  }, [camera]);

  return {
    zoomStateRef,
    handleWheel,
    updateTargetZoom,
    updateZoom,
  };
}; 