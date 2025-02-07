import { Vector3 } from 'three';
import { CityData, CityId } from '../types/city';

// Coordinates are computed using a linear transformation:
// x = ((longitude - (-21.94))/(24.93 - (-21.94)))*10 - 5, y = ((latitude - 55.60)/(64.15 - 55.60))*10 - 5
// This maps lon/lat ranges to an approximate game coordinate system with x, y in [-5,5]

export const CITIES: CityData[] = [
  {
    id: 'stockholm',
    position: new Vector3(3.54, -0.64, 0),
    name: 'Stockholm',
    size: 'big',
    availableAirplanes: [
      { id: 'bb1', model: 'Bingo Buzzer', isAssigned: false },
      { id: 'bb2', model: 'Bingo Buzzer', isAssigned: false },
      { id: 'ff1', model: 'Fatso Fantastic', isAssigned: false },
    ],
  },
  {
    id: 'gothenburg',
    position: new Vector3(2.23, -2.53, 0),
    name: 'Gothenburg',
    size: 'small',
    availableAirplanes: [{ id: 'bb7', model: 'Bingo Buzzer', isAssigned: false }],
  },
  {
    id: 'copenhagen',
    position: new Vector3(2.36, -4.91, 0),
    name: 'Copenhagen',
    size: 'big',
    availableAirplanes: [
      { id: 'bb5', model: 'Bingo Buzzer', isAssigned: false },
      { id: 'bb6', model: 'Bingo Buzzer', isAssigned: false },
      { id: 'ff5', model: 'Fatso Fantastic', isAssigned: false },
    ],
  },
  {
    id: 'oslo',
    position: new Vector3(1.98, 0.04, 0),
    name: 'Oslo',
    size: 'small',
    availableAirplanes: [
      { id: 'bb4', model: 'Bingo Buzzer', isAssigned: false },
      { id: 'ff4', model: 'Fatso Fantastic', isAssigned: false },
    ],
  },
  {
    id: 'bergen',
    position: new Vector3(0.82, 0.6, 0),
    name: 'Bergen',
    size: 'small',
    availableAirplanes: [{ id: 'ff6', model: 'Fatso Fantastic', isAssigned: false }],
  },
  {
    id: 'helsinki',
    position: new Vector3(5.0, 0.34, 0),
    name: 'Helsinki',
    size: 'small',
    availableAirplanes: [
      { id: 'bb3', model: 'Bingo Buzzer', isAssigned: false },
      { id: 'ff2', model: 'Fatso Fantastic', isAssigned: false },
      { id: 'ff3', model: 'Fatso Fantastic', isAssigned: false },
    ],
  },
  {
    id: 'tampere',
    position: new Vector3(4.75, 1.9, 0),
    name: 'Tampere',
    size: 'small',
    availableAirplanes: [{ id: 'bb8', model: 'Bingo Buzzer', isAssigned: false }],
  },
  {
    id: 'reykjavik',
    position: new Vector3(-5.0, 5.0, 0),
    name: 'Reykjavik',
    size: 'small',
    availableAirplanes: [{ id: 'ff7', model: 'Fatso Fantastic', isAssigned: false }],
  },
  {
    id: 'trondheim',
    position: new Vector3(1.9, 4.15, 0),
    name: 'Trondheim',
    size: 'small',
    availableAirplanes: [{ id: 'bb9', model: 'Bingo Buzzer', isAssigned: false }],
  },
];

export const getCityPosition = (cityId: CityId): Vector3 => {
  const city = CITIES.find((c) => c.id === cityId);
  if (!city) throw new Error(`City ${cityId} not found`);
  return city.position.clone();
};
