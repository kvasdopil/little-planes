import { Vector3 } from 'three';
import { CityId, AvailableAirplane } from './city';

export type Route = {
  from: CityId;
  to: CityId;
  assignedAirplaneId: string;
};

export type Flight = {
  id: number;
  route: Route;
  isReturning: boolean;
  airplane: AvailableAirplane;
  startTime: number;
};

export type RouteInCreation = {
  from: CityId;
  to: CityId;
  position: Vector3;
};

export type CitySelection = {
  id: CityId;
  position: Vector3;
}; 