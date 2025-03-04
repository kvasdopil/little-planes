import React from 'react';
import * as THREE from 'three';
import useCities from '../hooks/useCities';

interface CitiesProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  earthRadius: number;
  horizontalPivot: THREE.Object3D;
  verticalPivot: THREE.Object3D;
  updateTargetRotation?: (
    horizontalTarget: number,
    verticalTarget: number,
    targetZoom: number
  ) => void;
}

/**
 * Component for rendering city markers and labels on the globe
 */
const Cities: React.FC<CitiesProps> = ({ scene, camera, earthRadius, updateTargetRotation }) => {
  // Use the cities hook to handle all city-related functionality
  useCities({
    scene,
    camera,
    earthRadius,
    updateTargetRotation,
  });

  // This component doesn't render anything directly, it just attaches cities to the scene
  return null;
};

export default Cities;
