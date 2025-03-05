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

  // Spring for smooth animations - now including distance/zoom
  const { x, y, z } = useSpring({
    x: -1 * latRad,
    y: -1 * longRad,
    z: distance, // Add z for distance/zoom animation
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
          <animated.group position-z={z}>
            <PerspectiveCamera ref={cameraRef} makeDefault fov={fov} />
          </animated.group>
        </animated.group>
      </animated.group>
    </group>
  );
}
