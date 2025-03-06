import { Vector3, CubicBezierCurve3 } from 'three';
import { CityModel } from '../components/Cities';
import { geoToCartesian } from './coordinates';

/**
 * Creates a curved flight path between two cities
 *
 * @param startCity The origin city
 * @param endCity The destination city
 * @param maxHeight The maximum height of the arc as a proportion of the Earth's radius
 * @param earthRadius The radius of the Earth model
 * @returns A CubicBezierCurve3 representing the flight path
 */
export function createFlightCurve(
  startCity: CityModel,
  endCity: CityModel,
  maxHeight: number,
  earthRadius: number
) {
  // Convert start and end points to Cartesian coordinates
  const start = geoToCartesian(startCity.latitude, startCity.longitude, earthRadius);
  const end = geoToCartesian(endCity.latitude, endCity.longitude, earthRadius);

  // Calculate midpoint for the arc
  const midpoint = new Vector3().lerpVectors(start, end, 0.5);
  const midpointHeight = midpoint
    .clone()
    .normalize()
    .multiplyScalar(earthRadius * (1.0 + maxHeight));

  // Create a cubic bezier curve
  return new CubicBezierCurve3(start, midpointHeight, midpointHeight, end);
}
