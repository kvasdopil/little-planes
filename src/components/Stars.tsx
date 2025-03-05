import { useRef, useEffect } from 'react';
import { BufferGeometry, Float32BufferAttribute, Points } from 'three';

interface StarsProps {
  count?: number;
  radius?: number;
}

export function Stars({ count = 5000, radius = 100 }: StarsProps) {
  const points = useRef<Points>(null);

  useEffect(() => {
    if (points.current) {
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        // Generate random spherical coordinates
        const theta = Math.random() * Math.PI * 2; // azimuthal angle
        const phi = Math.acos(Math.random() * 2 - 1); // polar angle
        const r = radius;

        // Convert to Cartesian coordinates
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      points.current.geometry = geometry;
    }
  }, [count, radius]);

  /* eslint-disable react/no-unknown-property */
  return (
    <points ref={points}>
      <pointsMaterial size={0.15} color="white" transparent opacity={0.8} sizeAttenuation={true} />
    </points>
  );
  /* eslint-enable react/no-unknown-property */
}
