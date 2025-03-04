import { useEffect, useState, RefObject } from 'react';
import * as THREE from 'three';
import { EARTH_CONSTANTS, DEFAULT_CAMERA_POSITION } from '../utils/constants';
import { calculateDynamicFOV } from '../utils/animation';

interface GlobeSetupResult {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  earth: THREE.Mesh | null;
  horizontalPivot: THREE.Object3D | null;
  verticalPivot: THREE.Object3D | null;
  earthRadius: number;
}

/**
 * Custom hook for setting up the 3D scene with Earth and stars
 * @param containerRef - Reference to the container element
 * @returns Objects needed for scene manipulation
 */
export const useGlobeSetup = (containerRef: RefObject<HTMLDivElement | null>): GlobeSetupResult => {
  const [sceneObjects, setSceneObjects] = useState<GlobeSetupResult>({
    scene: null,
    camera: null,
    renderer: null,
    earth: null,
    horizontalPivot: null,
    verticalPivot: null,
    earthRadius: EARTH_CONSTANTS.EARTH_RADIUS,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Black background
    container.appendChild(renderer.domElement);

    // Load Earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/textures/earth.jpg');

    // Create Earth sphere with texture
    const earthRadius = EARTH_CONSTANTS.EARTH_RADIUS;
    const geometry = new THREE.SphereGeometry(earthRadius, 64, 64); // Higher resolution for better texture mapping
    const material = new THREE.MeshBasicMaterial({
      map: earthTexture,
    });
    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Add stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Create a nested pivot system for independent rotation axes
    // Outer pivot for horizontal rotation around the vertical axis
    const horizontalPivot = new THREE.Object3D();
    scene.add(horizontalPivot);

    // Inner pivot for vertical rotation
    const verticalPivot = new THREE.Object3D();
    horizontalPivot.add(verticalPivot);

    // Add camera to the vertical pivot with the default zoom value
    verticalPivot.add(camera);
    camera.position.set(0, 0, DEFAULT_CAMERA_POSITION.ZOOM);

    // Apply default rotation values
    horizontalPivot.rotation.y = DEFAULT_CAMERA_POSITION.HORIZONTAL_ROTATION;
    verticalPivot.rotation.x = DEFAULT_CAMERA_POSITION.VERTICAL_ROTATION;

    // Ensure FOV is correct based on the zoom level
    const dynamicFOV = calculateDynamicFOV(
      DEFAULT_CAMERA_POSITION.ZOOM,
      EARTH_CONSTANTS.MIN_CAMERA_DISTANCE,
      EARTH_CONSTANTS.MAX_CAMERA_DISTANCE,
      EARTH_CONSTANTS.MIN_FOV,
      EARTH_CONSTANTS.MAX_FOV
    );
    camera.fov = dynamicFOV;
    camera.updateProjectionMatrix();

    // Perform an initial render to show the default position
    renderer.render(scene, camera);

    // Set scene objects
    setSceneObjects({
      scene,
      camera,
      renderer,
      earth,
      horizontalPivot,
      verticalPivot,
      earthRadius,
    });

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (starsGeometry) starsGeometry.dispose();
      if (starsMaterial) starsMaterial.dispose();
    };
  }, [containerRef]);

  return sceneObjects;
};

export default useGlobeSetup;
