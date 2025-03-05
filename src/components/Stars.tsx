import { useRef, useEffect } from 'react';
import { BufferGeometry, Float32BufferAttribute, Points, Color } from 'three';

// Constants for star properties
const LARGE_STAR_PROBABILITY = 0.1; // 10% chance of being a large star
const SMALL_STAR_MIN_SIZE = 0.5;
const SMALL_STAR_MAX_SIZE = 1;
const LARGE_STAR_MIN_SIZE = 3;
const LARGE_STAR_MAX_SIZE = 5;

// Star color variations
const STAR_COLORS = [
  new Color(0xffffff), // White
  new Color(0xffd7a6), // Warm white
  new Color(0xa6c9ff), // Cool white
  new Color(0xffa6a6), // Reddish
  new Color(0xa6ffed), // Bluish
];

interface StarsProps {
  count: number;
  radius: number;
}

export function Stars({ count, radius }: StarsProps) {
  const points = useRef<Points>(null);

  useEffect(() => {
    if (points.current) {
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);

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

        // Random star color
        const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Random star size (with some stars being notably larger)
        const isLargeStar = Math.random() < LARGE_STAR_PROBABILITY;
        sizes[i] = isLargeStar
          ? LARGE_STAR_MIN_SIZE + Math.random() * (LARGE_STAR_MAX_SIZE - LARGE_STAR_MIN_SIZE)
          : SMALL_STAR_MIN_SIZE + Math.random() * (SMALL_STAR_MAX_SIZE - SMALL_STAR_MIN_SIZE);
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
      geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1));
      points.current.geometry = geometry;
    }
  }, [count, radius]);

  return (
    <points ref={points}>
      <pointsMaterial
        vertexColors
        sizeAttenuation={true}
        transparent
        opacity={0.8}
        depthWrite={false}
        size={0.15}
      />
    </points>
  );
}
