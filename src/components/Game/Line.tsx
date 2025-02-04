import { Line as ThreeLine } from '@react-three/drei';
import { Vector3 } from 'three';

interface LineProps {
  start: Vector3;
  end: Vector3;
}

export const Line = ({ start, end }: LineProps) => {
  return <ThreeLine points={[start, end]} color="white" lineWidth={1} />;
};
