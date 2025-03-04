import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { CITIES } from '../utils/constants';
import { latLngToVector3 } from '../utils/coordinates';

interface UseCityMarkersProps {
  scene: THREE.Scene;
  earthRadius: number;
}

export interface CityMarkerRefs {
  citiesGroupRef: React.MutableRefObject<THREE.Group>;
  cityMeshesRef: React.MutableRefObject<THREE.Mesh[]>;
  cityPositionsRef: React.MutableRefObject<THREE.Vector3[]>;
  cityMaterial: THREE.MeshBasicMaterial;
  highlightMaterial: THREE.MeshBasicMaterial;
}

/**
 * Hook for managing city markers on the globe
 */
export const useCityMarkers = ({ scene, earthRadius }: UseCityMarkersProps): CityMarkerRefs => {
  // References for city objects
  const citiesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const cityMeshesRef = useRef<THREE.Mesh[]>([]);
  const cityPositionsRef = useRef<THREE.Vector3[]>([]);
  
  // Materials
  const cityMaterialRef = useRef<THREE.MeshBasicMaterial>(
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  const highlightMaterialRef = useRef<THREE.MeshBasicMaterial>(
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  
  // Setup city meshes
  useEffect(() => {
    // Create a group to hold all cities
    const citiesGroup = citiesGroupRef.current;
    scene.add(citiesGroup);
    
    // Add each city to the scene
    CITIES.forEach((city, index) => {
      const position = latLngToVector3(city.lat, city.lng, earthRadius);
      cityPositionsRef.current.push(position.clone());
      
      // Create city marker (white sphere)
      const cityGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const cityMesh = new THREE.Mesh(cityGeometry, cityMaterialRef.current.clone());
      cityMesh.userData = { cityIndex: index, originalScale: 1 };
      cityMesh.position.copy(position);
      citiesGroup.add(cityMesh);
      cityMeshesRef.current.push(cityMesh);
    });
    
    // Cleanup function
    return () => {
      // Remove city meshes
      cityMeshesRef.current.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      
      scene.remove(citiesGroup);
    };
  }, [scene, earthRadius]);
  
  return {
    citiesGroupRef,
    cityMeshesRef,
    cityPositionsRef,
    cityMaterial: cityMaterialRef.current,
    highlightMaterial: highlightMaterialRef.current,
  };
}; 