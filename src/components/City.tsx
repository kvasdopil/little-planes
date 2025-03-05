import { Sphere } from '@react-three/drei';
import { geoToCartesian } from '../utils/coordinates';

interface CityProps {
  name: string;
  latitude: number;
  longitude: number;
  size: number;
}

const EARTH_RADIUS = 2;

export function City({ latitude, longitude, size }: CityProps) {
  const position = geoToCartesian(latitude, longitude, EARTH_RADIUS);

  return (
    <group position={position}>
      <Sphere args={[size, 16, 16]}>
        <meshBasicMaterial color="white" />
      </Sphere>
    </group>
  );
}
