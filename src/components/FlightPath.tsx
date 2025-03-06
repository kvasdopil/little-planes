import { CubicBezierLine } from '@react-three/drei';
import { useMemo } from 'react';
import { CityModel } from './Cities';
import { createFlightCurve } from '../utils/flightCurve';

interface FlightPathProps {
  startCity: CityModel;
  endCity: CityModel;
  maxHeight: number;
}

const EARTH_RADIUS = 2;

export function FlightPath({ startCity, endCity, maxHeight }: FlightPathProps) {
  // Use the shared flight curve function to create the curve
  const curve = useMemo(
    () => createFlightCurve(startCity, endCity, maxHeight, EARTH_RADIUS),
    [startCity, endCity, maxHeight]
  );

  // Extract points for rendering the curve
  const start = curve.getPointAt(0);
  const end = curve.getPointAt(1);

  // For a cubic bezier curve, we need to get the two control points
  // Since createFlightCurve returns CubicBezierCurve3, we can access its control points
  const midA = curve.v1;
  const midB = curve.v2;

  return (
    <CubicBezierLine
      start={start}
      end={end}
      midA={midA}
      midB={midB}
      color="white"
      lineWidth={3}
      dashed={false}
    />
  );
}
