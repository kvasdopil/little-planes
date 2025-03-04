declare module 'troika-three-text' {
  import { Object3D, Vector3, Quaternion } from 'three';

  export class Text extends Object3D {
    text: string;
    fontSize: number;
    color: number | string;
    anchorX: string;
    anchorY: string;
    position: Vector3;
    quaternion: Quaternion;
    scale: Vector3;
    outlineWidth: number | string;
    outlineColor: number | string;
    outlineOpacity: number;
    outlineBlur: number | string;
    outlineOffsetX: number | string;
    outlineOffsetY: number | string;
    sync(): void;
    dispose(): void;
  }
}
