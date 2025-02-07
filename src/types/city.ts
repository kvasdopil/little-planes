import { Vector3 } from 'three';

export interface CityData {
  id: string;
  position: Vector3;
  name: string;
}

export type CityId = string; 