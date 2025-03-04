import * as THREE from 'three';

/**
 * Converts latitude and longitude to 3D coordinates on a sphere
 * @param lat - Latitude in degrees
 * @param lng - Longitude in degrees
 * @param radius - Radius of the sphere
 * @returns Vector3 with the 3D coordinates
 */
export const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

/**
 * Converts normalized mouse coordinates to 3D coordinates
 * @param event - Mouse event
 * @param domElement - DOM element for reference (optional)
 * @returns Normalized coordinates in the range [-1, 1]
 */
export const getNormalizedMousePosition = (
  event: MouseEvent | React.MouseEvent<HTMLElement> | WheelEvent,
  domElement?: HTMLElement
) => {
  if (domElement) {
    // If a domElement is provided, use its boundaries
    const rect = domElement.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
    };
  } else {
    // If no domElement is provided, use the window dimensions
    return {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1,
    };
  }
};
