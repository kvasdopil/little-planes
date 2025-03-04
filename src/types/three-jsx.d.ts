import { ReactThreeFiber } from '@react-three/fiber';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
      sphereGeometry: ReactThreeFiber.BufferGeometryNode<
        THREE.SphereGeometry,
        typeof THREE.SphereGeometry
      >;
      meshBasicMaterial: ReactThreeFiber.MaterialNode<
        THREE.MeshBasicMaterial,
        typeof THREE.MeshBasicMaterial
      >;
      ambientLight: ReactThreeFiber.LightNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
    }
  }
}
