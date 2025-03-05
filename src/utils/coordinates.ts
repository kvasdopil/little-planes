import { Vector3 } from 'three';

/**
 * Converts geographic coordinates to Cartesian coordinates
 * @param latitude Latitude in degrees
 * @param longitude Longitude in degrees
 * @param radius Distance from center (defaults to 1 for unit sphere)
 * @returns Vector3 representing the Cartesian coordinates
 */
export function geoToCartesian(latitude: number, longitude: number, radius: number = 1): Vector3 {
  // Convert degrees to radians
  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (-longitude * Math.PI) / 180;

  // Calculate position
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  return new Vector3(x, y, z);
}
