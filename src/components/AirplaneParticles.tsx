import { useRef, useEffect, RefObject } from 'react';
import { Vector3, Mesh, SphereGeometry, MeshBasicMaterial, Group } from 'three';
import { useFrame } from '@react-three/fiber';

interface Particle {
  mesh: Mesh;
  lifespan: number;
  maxLifespan: number;
  initialScale: number;
  initialPosition: Vector3;
}

interface AirplaneParticlesProps {
  groupRef: RefObject<Group>;
  maxParticles: number;
  emissionRate: number; // particles per second
  particleLifespan: number; // seconds
  color: string;
  size: number;
}

export function AirplaneParticles({
  groupRef,
  maxParticles,
  emissionRate,
  particleLifespan,
  color,
  size,
}: AirplaneParticlesProps) {
  const particlesGroupRef = useRef<Group>(null);
  const particles = useRef<Particle[]>([]);
  const lastEmissionTime = useRef<number>(0);

  // Create reusable geometry and material for particles
  const geometry = useRef<SphereGeometry>(new SphereGeometry(1, 8, 8));
  const material = useRef<MeshBasicMaterial>(
    new MeshBasicMaterial({ color, transparent: true, opacity: 0.8 })
  );

  // Clean up when component unmounts - fixing React hooks warning
  useEffect(() => {
    // Store references to current geometry, material, and particlesGroup for cleanup
    const currentGeometry = geometry.current;
    const currentMaterial = material.current;
    const currentParticlesGroup = particlesGroupRef.current;
    const currentParticles = [...particles.current];

    return () => {
      // Clean up using the stored references
      if (currentGeometry) currentGeometry.dispose();
      if (currentMaterial) currentMaterial.dispose();

      // Also clean up any remaining particles to prevent memory leaks
      if (currentParticles.length > 0 && currentParticlesGroup) {
        currentParticles.forEach((particle) => {
          currentParticlesGroup.remove(particle.mesh);
          if (particle.mesh.geometry) particle.mesh.geometry.dispose();
          if (particle.mesh.material) {
            if (Array.isArray(particle.mesh.material)) {
              particle.mesh.material.forEach((mat) => mat.dispose());
            } else {
              particle.mesh.material.dispose();
            }
          }
        });
        particles.current = [];
      }
    };
  }, []);

  // Update when color changes
  useEffect(() => {
    material.current.color.set(color);
  }, [color]);

  useFrame((_, delta) => {
    if (!particlesGroupRef.current || !groupRef.current) return;

    // Get the emitter's world position
    const emitterWorldPosition = new Vector3();
    groupRef.current.getWorldPosition(emitterWorldPosition);

    // Calculate current time for emission control
    const currentTime = performance.now() / 1000;

    // Emit new particles based on emission rate
    if (
      currentTime - lastEmissionTime.current > 1 / emissionRate &&
      particles.current.length < maxParticles
    ) {
      // Create a particle at the emitter's current world position
      const particle = createParticle(emitterWorldPosition, size);
      particles.current.push(particle);

      // The particle mesh needs to be in world space, not relative to the emitter
      particlesGroupRef.current.add(particle.mesh);

      // Update the emission time
      lastEmissionTime.current = currentTime;
    }

    // Update existing particles
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const particle = particles.current[i];

      // Reduce lifespan
      particle.lifespan -= delta;

      // Calculate scale based on remaining lifespan
      const scale = (particle.lifespan / particle.maxLifespan) * particle.initialScale;
      particle.mesh.scale.set(scale, scale, scale);

      // Also fade opacity based on lifespan
      (particle.mesh.material as MeshBasicMaterial).opacity =
        0.8 * (particle.lifespan / particle.maxLifespan);

      // Remove particles that have expired
      if (particle.lifespan <= 0) {
        particlesGroupRef.current.remove(particle.mesh);
        particles.current.splice(i, 1);
        particle.mesh.geometry.dispose();
        (particle.mesh.material as MeshBasicMaterial).dispose();
      }
    }
  });

  // Create a new particle
  const createParticle = (pos: Vector3, particleSize: number): Particle => {
    const mesh = new Mesh(geometry.current, material.current.clone());
    // Position the particle at the emitter's world position
    mesh.position.copy(pos);

    const initialScale = particleSize;
    mesh.scale.set(initialScale, initialScale, initialScale);

    return {
      mesh,
      lifespan: particleLifespan,
      maxLifespan: particleLifespan,
      initialScale,
      initialPosition: pos.clone(),
    };
  };

  // The particlesGroupRef should be at the root level in the scene
  // This ensures particles are in world space and not relative to any other transformation
  return <group ref={particlesGroupRef} />;
}
