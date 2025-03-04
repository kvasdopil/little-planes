import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { CITIES } from '../utils/constants';
import { latLngToVector3 } from '../utils/coordinates';
import { calculateBounceValue } from '../utils/animation';

interface UseCityInteractionProps {
  camera: THREE.Camera;
  cityMeshes: THREE.Mesh[];
  earthRadius: number;
  cityMaterial: THREE.MeshBasicMaterial;
  highlightMaterial: THREE.MeshBasicMaterial;
  updateTargetRotation?: (
    horizontalTarget: number,
    verticalTarget: number,
    targetZoom: number
  ) => void;
}

export interface CityInteractionState {
  selectedCityRef: React.MutableRefObject<number | null>;
  hoveredCityRef: React.MutableRefObject<number | null>;
  isAnimatingRef: React.MutableRefObject<boolean>;
}

/**
 * Hook for handling city interactions (hover, selection, etc.)
 */
export const useCityInteraction = ({
  camera,
  cityMeshes,
  earthRadius,
  cityMaterial,
  highlightMaterial,
  updateTargetRotation,
}: UseCityInteractionProps): CityInteractionState => {
  // References for tracking state
  const selectedCityRef = useRef<number | null>(null);
  const hoveredCityRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const animationStartTimeRef = useRef<number | null>(null);
  const isAnimatingRef = useRef<boolean>(false);

  // Function to start the bounce animation
  const startBounceAnimation = useCallback((cityIndex: number) => {
    // Cancel any existing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    // Set the animation start time
    animationStartTimeRef.current = performance.now();
    isAnimatingRef.current = true;

    // The bounce animation function
    const animate = (timestamp: number) => {
      if (animationStartTimeRef.current === null) {
        animationStartTimeRef.current = timestamp;
      }

      const elapsed = timestamp - animationStartTimeRef.current;
      const duration = 800; // Animation duration in ms

      // Calculate animation progress (0 to 1)
      const progress = Math.min(elapsed / duration, 1);

      // Get the bounce scale factor
      const scaleFactor = calculateBounceValue(progress);

      // Apply the scale to the city mesh
      const cityMesh = cityMeshes[cityIndex];
      if (cityMesh) {
        const baseScale = cityMesh.userData.currentScale || 1;
        cityMesh.scale.set(
          baseScale * scaleFactor,
          baseScale * scaleFactor,
          baseScale * scaleFactor
        );
      }

      // Continue the animation if not complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete, reset to normal scale
        if (cityMesh) {
          const baseScale = cityMesh.userData.currentScale || 1;
          cityMesh.scale.set(baseScale, baseScale, baseScale);
        }
        animationRef.current = null;
        animationStartTimeRef.current = null;
        isAnimatingRef.current = false;
      }
    };

    // Start the animation
    animationRef.current = requestAnimationFrame(animate);
  }, [cityMeshes]);

  // Function to reset city animation
  const resetCityAnimation = useCallback((cityIndex: number) => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      isAnimatingRef.current = false;
    }

    // Reset the scale to normal
    const cityMesh = cityMeshes[cityIndex];
    if (cityMesh) {
      const baseScale = cityMesh.userData.currentScale || 1;
      cityMesh.scale.set(baseScale, baseScale, baseScale);
    }
  }, [cityMeshes]);

  // Function to animate camera to a city
  const flyToCity = useCallback((targetPosition: THREE.Vector3) => {
    if (!updateTargetRotation) {
      console.error('updateTargetRotation function is not available');
      return;
    }

    // Get the direction vector from the origin to the target city
    const originToCity = targetPosition.clone().normalize();

    // Calculate the horizontal rotation (around Y axis)
    const targetHorizontalRotation = Math.atan2(originToCity.x, originToCity.z);

    // The vertical rotation is the angle from the XZ plane (negative because we're looking down)
    const targetVerticalRotation = -Math.asin(originToCity.y);

    // Target zoom level (closer to the city)
    const targetZoom = 3;

    // Update the target rotation in the parent component
    updateTargetRotation(targetHorizontalRotation, targetVerticalRotation, targetZoom);
  }, [updateTargetRotation]);

  // Setup event handlers
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Handle click events for city selection
    const handleClick = (event: MouseEvent | React.MouseEvent<HTMLElement>) => {
      // Convert mouse position to normalized device coordinates
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Set up the raycaster
      raycaster.setFromCamera(mouse, camera);

      // Check for intersections with city meshes
      const intersects = raycaster.intersectObjects(cityMeshes);

      if (intersects.length > 0) {
        const cityMesh = intersects[0].object as THREE.Mesh;
        const cityIndex = cityMesh.userData.cityIndex;

        // If we're clicking the same city that's already selected, do nothing
        if (selectedCityRef.current === cityIndex) {
          return;
        }

        // Reset previous selection
        if (selectedCityRef.current !== null) {
          cityMeshes[selectedCityRef.current].material = cityMaterial.clone();
        }

        // Highlight selected city
        cityMesh.material = highlightMaterial.clone();
        selectedCityRef.current = cityIndex;

        // Get the city data
        const selectedCity = CITIES[cityIndex];
        const targetPosition = latLngToVector3(selectedCity.lat, selectedCity.lng, earthRadius);

        // Animate camera to the selected city
        flyToCity(targetPosition);
      }
    };

    // Handle mouse move events for city hover detection
    const handleMouseMove = (event: MouseEvent | React.MouseEvent<HTMLElement>) => {
      // Convert mouse position to normalized device coordinates
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Set up the raycaster
      raycaster.setFromCamera(mouse, camera);

      // Check for intersections with city meshes
      const intersects = raycaster.intersectObjects(cityMeshes);

      if (intersects.length > 0) {
        const cityMesh = intersects[0].object as THREE.Mesh;
        const cityIndex = cityMesh.userData.cityIndex;

        // If we're hovering over a new city
        if (hoveredCityRef.current !== cityIndex) {
          // Reset previous hover animation if exists
          if (hoveredCityRef.current !== null) {
            resetCityAnimation(hoveredCityRef.current);
          }

          // Start new hover animation
          startBounceAnimation(cityIndex);
          hoveredCityRef.current = cityIndex;
        }
      } else if (hoveredCityRef.current !== null) {
        // Mouse is not over any city, reset the previous hover
        resetCityAnimation(hoveredCityRef.current);
        hoveredCityRef.current = null;
      }
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);

      // Cancel any ongoing animation
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [camera, cityMeshes, cityMaterial, highlightMaterial, earthRadius, startBounceAnimation, resetCityAnimation, flyToCity]);

  return {
    selectedCityRef,
    hoveredCityRef,
    isAnimatingRef,
  };
}; 