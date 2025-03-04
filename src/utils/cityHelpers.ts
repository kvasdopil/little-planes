import * as THREE from 'three';
import { Text } from 'troika-three-text';

/**
 * Updates city meshes and labels based on camera position
 * @param cityMeshes - Array of city meshes
 * @param cityLabels - Array of city labels
 * @param camera - Three.js camera
 * @param hoveredCityIndex - Index of the city being hovered, if any
 * @param isAnimating - Whether the city is currently being animated
 */
export const updateCitiesAndLabels = (
  cityMeshes: THREE.Mesh[],
  cityLabels: Text[],
  camera: THREE.Camera,
  hoveredCityIndex: number | null,
  isAnimating: boolean
): void => {
  // Get the camera position in world space
  const cameraPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraPosition);

  // Update each city and its label
  cityMeshes.forEach((cityMesh, index) => {
    // Get the current world position of the city
    const cityWorldPosition = new THREE.Vector3();
    cityMesh.getWorldPosition(cityWorldPosition);

    // Calculate distance from camera to city
    const distance = cityWorldPosition.distanceTo(cameraPosition);

    // Scale city inversely proportional to distance
    const scale = distance * 0.03;

    // Save current scale for use in animations
    cityMesh.userData.currentScale = scale;

    // Only update scale if this city isn't being animated
    if (hoveredCityIndex !== index || !isAnimating) {
      cityMesh.scale.set(scale, scale, scale);
    }

    const label = cityLabels[index];
    if (!label) return;

    // Update label position to match city's world position
    label.position.copy(cityWorldPosition);

    // Offset the label slightly above the city (radial direction)
    const offsetDirection = cityWorldPosition.clone().normalize();
    label.position.add(offsetDirection.multiplyScalar(0.5 * scale));

    // Add additional offset toward the north pole
    const northPoleDirection = new THREE.Vector3(0, 1, 0);
    label.position.add(northPoleDirection.clone().multiplyScalar(0.3 * scale));

    // Scale label based on distance
    label.fontSize = 0.5 * scale;

    // Make outline width consistent regardless of zoom level
    label.outlineWidth = '15%'; // 15% of font size gives constant visual width

    // Make label point along the meridian
    alignLabelWithMeridian(label, cityWorldPosition);

    // Force sync to update the label
    label.sync();
  });
};

/**
 * Aligns city label with meridian
 * @param label - City label to align
 * @param cityPosition - Position of the city
 */
export const alignLabelWithMeridian = (label: Text, cityPosition: THREE.Vector3): void => {
  // 1. Get the normalized direction from globe center to city (normal vector to the globe surface)
  const normalVector = cityPosition.clone().normalize();

  // 2. Create an up vector (always points to the north pole)
  const upVector = new THREE.Vector3(0, 1, 0);

  // 3. Calculate the east vector (tangent to the latitude line)
  // This is perpendicular to both the normal and up vectors
  const eastVector = new THREE.Vector3();
  eastVector.crossVectors(upVector, normalVector).normalize();

  // 4. Calculate the north vector (tangent to the meridian)
  // This is perpendicular to both the normal and east vectors
  const northVector = new THREE.Vector3();
  northVector.crossVectors(normalVector, eastVector).normalize();

  // 5. Create a rotation matrix that aligns the label with the meridian
  const rotationMatrix = new THREE.Matrix4();

  // The columns of the matrix represent the local coordinate system
  rotationMatrix.makeBasis(eastVector, northVector, normalVector);

  // 6. Create a quaternion from the rotation matrix and apply it to the label
  const quaternion = new THREE.Quaternion();
  quaternion.setFromRotationMatrix(rotationMatrix);

  // Apply the quaternion to the label
  label.quaternion.copy(quaternion);
};
