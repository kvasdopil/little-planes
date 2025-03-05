import { useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { Group, PerspectiveCamera as ThreePerspectiveCamera, MathUtils } from 'three';
import { useSpring, animated } from '@react-spring/three';

interface CameraProps {
  latitude: number;
  longitude: number;
  distance: number;
  fov: number;
}

export function Camera({ latitude, longitude, distance, fov }: CameraProps) {
  const pivotRef = useRef<Group>(null);
  const cameraRef = useRef<ThreePerspectiveCamera>(null);

  // Convert latitude/longitude to radians for rotation
  const latRad = MathUtils.degToRad(latitude);
  const longRad = MathUtils.degToRad(-longitude); // Negative to match standard mapping

  // Spring for smooth animations
  const { x, y } = useSpring({
    x: -1 * latRad,
    y: -1 * longRad,
    config: {
      mass: 1,
      tension: 180,
      friction: 30,
      precision: 0.001,
    },
  });

  return (
    <group ref={pivotRef}>
      <animated.group rotation-y={y}>
        <animated.group rotation-x={x}>
          <PerspectiveCamera ref={cameraRef} makeDefault fov={fov} position={[0, 0, distance]} />
        </animated.group>
      </animated.group>
    </group>
  );
}
