import { Text } from '@react-three/drei';

interface CityLabelProps {
  name: string;
}

const LABEL_SIZE = 0.05;
const LABEL_OFFSET: [number, number, number] = [0, 0.05, 0.01];

export function CityLabel({ name }: CityLabelProps) {
  return (
    <Text
      fontSize={LABEL_SIZE}
      color="white"
      anchorX="center"
      anchorY="middle"
      outlineWidth="15%"
      outlineColor="#000000"
      outlineOpacity={0.8}
      maxWidth={2}
      position={LABEL_OFFSET}
    >
      {name}
    </Text>
  );
}
