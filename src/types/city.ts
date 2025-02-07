import { Vector3 } from 'three';

export type CitySize = 'small' | 'big';

export type AirplaneModel = 'Bingo Buzzer' | 'Fatso Fantastic';

export interface AvailableAirplane {
  model: AirplaneModel;
  id: string;
  isAssigned: boolean;
}

export interface CityData {
  id: string;
  position: Vector3;
  name: string;
  size: CitySize;
  availableAirplanes: AvailableAirplane[];
}

export type CityId = string;
