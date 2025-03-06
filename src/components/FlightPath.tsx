import { QuadraticBezierLine } from '@react-three/drei';
import { Vector3 } from 'three';
import { geoToCartesian } from '../utils/coordinates';

interface FlightPathProps {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  maxHeight: number;
}

const EARTH_RADIUS = 2;

export function FlightPath({ startLat, startLon, endLat, endLon, maxHeight }: FlightPathProps) {
  // Convert start and end points to Cartesian coordinates
  const start = geoToCartesian(startLat, startLon, EARTH_RADIUS);
  const end = geoToCartesian(endLat, endLon, EARTH_RADIUS);

  // Calculate midpoint between start and end
  const midpoint = new Vector3().addVectors(start, end).multiplyScalar(0.5);
  midpoint.normalize().multiplyScalar(EARTH_RADIUS * (1.0 + maxHeight));

  return (
    <QuadraticBezierLine
      start={start}
      end={end}
      mid={midpoint}
      color="white"
      lineWidth={3}
      dashed={false}
    />
  );
}
