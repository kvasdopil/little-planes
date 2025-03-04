import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { CITIES } from '../utils/constants';
import { updateCitiesAndLabels } from '../utils/cityHelpers';

interface UseCityLabelsProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  earthRadius: number;
  cityMeshes: THREE.Mesh[];
  hoveredCityIndex: React.MutableRefObject<number | null>;
  isAnimating: React.MutableRefObject<boolean>;
}

export interface CityLabelRefs {
  labelsGroupRef: React.MutableRefObject<THREE.Group>;
  cityLabelsRef: React.MutableRefObject<Text[]>;
  updateLabels: () => void;
}

/**
 * Hook for managing city labels on the globe
 */
export const useCityLabels = ({
  scene,
  camera,
  earthRadius,
  cityMeshes,
  hoveredCityIndex,
  isAnimating,
}: UseCityLabelsProps): CityLabelRefs => {
  // References for label objects
  const labelsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const cityLabelsRef = useRef<Text[]>([]);

  // Setup city labels
  useEffect(() => {
    // Create a group to hold all labels
    const labelsGroup = labelsGroupRef.current;
    scene.add(labelsGroup);

    // Add each city label
    CITIES.forEach((city) => {
      // Create city label
      const label = new Text();
      label.text = city.name;
      label.fontSize = 1.0;
      label.color = 0xffffff;
      label.anchorX = 'center';
      label.anchorY = 'bottom';
      label.outlineWidth = '10%';
      label.outlineColor = 0x000000;
      label.outlineOpacity = 0.3;

      // Add label to the group
      labelsGroup.add(label);
      cityLabelsRef.current.push(label);

      // Sync and render the text
      label.sync();
    });

    // Cleanup function
    return () => {
      // Dispose of labels
      cityLabelsRef.current.forEach((label) => {
        label.dispose();
      });

      scene.remove(labelsGroup);
    };
  }, [scene, earthRadius]);

  // Function to update labels in animation loop
  const updateLabels = () => {
    updateCitiesAndLabels(
      cityMeshes,
      cityLabelsRef.current,
      camera,
      hoveredCityIndex.current,
      isAnimating.current
    );
  };

  return {
    labelsGroupRef,
    cityLabelsRef,
    updateLabels,
  };
}; 