import { useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { DEFAULT_CAMERA_POSITION } from '../utils/constants';
import { useAnimationLoop } from './useAnimationLoop';
import { useEarthRotation } from './useEarthRotation';
import { useEarthZoom } from './useEarthZoom';

interface EarthInteractionProps {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  earth: THREE.Mesh | null;
  horizontalPivot: THREE.Object3D | null;
  verticalPivot: THREE.Object3D | null;
}

interface EarthInteractionResult {
  updateTargetRotation: (
    horizontalTarget: number,
    verticalTarget: number,
    targetZoom: number
  ) => void;
}

/**
 * Custom hook for Earth interaction (rotation, zooming, etc.)
 */
export const useEarthInteraction = ({
  scene,
  camera,
  renderer,
  earth,
  horizontalPivot,
  verticalPivot,
}: EarthInteractionProps): EarthInteractionResult => {
  // Use the earth rotation hook
  const {
    updateTargetRotation: updateRotation,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    updateRotation: updateRotationValues,
  } = useEarthRotation({
    horizontalPivot,
    verticalPivot,
    scene,
    earth,
    camera,
    domElement: renderer?.domElement || null,
  });

  // Use the earth zoom hook
  const {
    handleWheel,
    updateTargetZoom,
    updateZoom: updateZoomValues,
  } = useEarthZoom({
    camera,
  });

  // Set up initial values
  useEffect(() => {
    if (!horizontalPivot || !verticalPivot || !camera || !renderer || !scene) return;

    // Set initial camera position and rotation
    horizontalPivot.rotation.y = DEFAULT_CAMERA_POSITION.HORIZONTAL_ROTATION;
    verticalPivot.rotation.x = DEFAULT_CAMERA_POSITION.VERTICAL_ROTATION;
    camera.position.z = DEFAULT_CAMERA_POSITION.ZOOM;

    // Render one frame
    renderer.render(scene, camera);
  }, [scene, camera, renderer, horizontalPivot, verticalPivot]);

  // Set up animation loop
  const animate = useCallback(() => {
    if (!renderer || !scene || !camera) return;

    // Update rotation
    updateRotationValues();

    // Update zoom
    updateZoomValues();

    // Render the scene
    renderer.render(scene, camera);
  }, [renderer, scene, camera, updateRotationValues, updateZoomValues]);

  // Use animation loop hook
  useAnimationLoop(animate);

  // Set up event listeners
  useEffect(() => {
    // Only add event listeners when we have all required dependencies
    if (!scene || !earth || !camera || !renderer) return;

    console.log('Setting up earth interaction event listeners');
    
    // Add event listeners
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel, { passive: true });

    // Cleanup
    return () => {
      console.log('Cleaning up earth interaction event listeners');
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [scene, earth, camera, renderer, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

  // Combined update function for external usage
  const updateTargetRotation = useCallback(
    (horizontalTarget: number, verticalTarget: number, targetZoom: number) => {
      updateRotation(horizontalTarget, verticalTarget);
      updateTargetZoom(targetZoom);
    },
    [updateRotation, updateTargetZoom]
  );

  return {
    updateTargetRotation,
  };
};

export default useEarthInteraction;
