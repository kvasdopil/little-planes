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
    availableAirplanes: [],
  },
  {
    id: 'copenhagen',
    position: new Vector3(2.36, -4.91, 0),
    name: 'Copenhagen',
    size: 'big',
    availableAirplanes: [],
  },
  {
    id: 'oslo',
    position: new Vector3(1.98, 0.04, 0),
    name: 'Oslo',
    size: 'small',
    availableAirplanes: [],
  },
  {
    id: 'bergen',
    position: new Vector3(0.82, 0.6, 0),
    name: 'Bergen',
    size: 'small',
    availableAirplanes: [],
  },
  {
    id: 'helsinki',
    position: new Vector3(5.0, 0.34, 0),
    name: 'Helsinki',
    size: 'small',
    availableAirplanes: [],
  },
  {
    id: 'tampere',
    position: new Vector3(4.75, 1.9, 0),
    name: 'Tampere',
    size: 'small',
    availableAirplanes: [],
  },
  {
    id: 'reykjavik',
    position: new Vector3(-5.0, 5.0, 0),
    name: 'Reykjavik',
    size: 'small',
    availableAirplanes: [],
  },
  {
    id: 'trondheim',
    position: new Vector3(1.9, 4.15, 0),
    name: 'Trondheim',
    size: 'small',
    availableAirplanes: [],
  },
];

export const getCityPosition = (cityId: CityId): Vector3 => {
  const city = findCity(cityId);
  return city.position.clone();
};

export const findCity = (cityId: CityId): CityData => {
  const city = CITIES.find((c) => c.id === cityId);
  if (!city) throw new Error(`City ${cityId} not found`);
  return city;
};
