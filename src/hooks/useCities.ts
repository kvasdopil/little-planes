import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useCityMarkers } from './useCityMarkers';
import { useCityLabels } from './useCityLabels';
import { useCityInteraction } from './useCityInteraction';
import { useAnimationLoop } from './useAnimationLoop';

interface UseCitiesProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  earthRadius: number;
  updateTargetRotation?: (
    horizontalTarget: number,
    verticalTarget: number,
    targetZoom: number
  ) => void;
}

/**
 * Custom hook for managing cities on the globe
 */
export const useCities = ({ scene, camera, earthRadius, updateTargetRotation }: UseCitiesProps) => {
  // Use the city markers hook
  const { cityMeshesRef, cityMaterial, highlightMaterial } = useCityMarkers({
    scene,
    earthRadius,
  });

  // Create refs for animation state
  const isAnimatingRef = useRef<boolean>(false);
  const hoveredCityRef = useRef<number | null>(null);

  // Use the city interaction hook
  const { hoveredCityRef: interactionHoveredCityRef, isAnimatingRef: interactionIsAnimatingRef } = useCityInteraction({
    camera,
    cityMeshes: cityMeshesRef.current,
    earthRadius,
    cityMaterial,
    highlightMaterial,
    updateTargetRotation,
  });

  // Sync the hover and animation state refs
  useEffect(() => {
    const syncRefs = () => {
      hoveredCityRef.current = interactionHoveredCityRef.current;
      isAnimatingRef.current = interactionIsAnimatingRef.current;
    };

    // Set up interval to sync refs (this is safer than trying to proxy the refs)
    const intervalId = setInterval(syncRefs, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [interactionHoveredCityRef, interactionIsAnimatingRef]);

  // Use the city labels hook
  const { updateLabels } = useCityLabels({
    scene,
    camera,
    earthRadius,
    cityMeshes: cityMeshesRef.current,
    hoveredCityIndex: hoveredCityRef,
    isAnimating: isAnimatingRef,
  });

  // Set up animation loop for updating cities
  const updateCities = () => {
    updateLabels();
  };

  useAnimationLoop(updateCities);
};

export default useCities;
