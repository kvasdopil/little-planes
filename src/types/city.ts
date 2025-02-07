import { Vector3 } from 'three';

export type CitySize = 'small' | 'big';

export interface CityData {
  id: string;
  position: Vector3;
  name: string;
  size: CitySize;
}

export type CityId = string;
