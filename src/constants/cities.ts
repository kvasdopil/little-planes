import { Vector3 } from 'three';
import { CityData } from '../types/city';

// Coordinates are computed using a linear transformation:
// x = ((longitude - (-21.94))/(24.93 - (-21.94)))*10 - 5, y = ((latitude - 55.60)/(64.15 - 55.60))*10 - 5
// This maps lon/lat ranges to an approximate game coordinate system with x, y in [-5,5]

export const CITIES: CityData[] = [
  { id: 'stockholm', position: new Vector3(3.54, -0.64, 0), name: 'Stockholm', size: 'big' },
  { id: 'gothenburg', position: new Vector3(2.23, -2.53, 0), name: 'Gothenburg', size: 'small' },
  { id: 'copenhagen', position: new Vector3(2.36, -4.91, 0), name: 'Copenhagen', size: 'big' },
  { id: 'oslo', position: new Vector3(1.98,  0.04, 0), name: 'Oslo', size: 'small' },
  { id: 'bergen', position: new Vector3(0.82,  0.60, 0), name: 'Bergen', size: 'small' },
  { id: 'helsinki', position: new Vector3(5.00,  0.34, 0), name: 'Helsinki', size: 'small' },
  { id: 'tampere', position: new Vector3(4.75,  1.90, 0), name: 'Tampere', size: 'small' },
  { id: 'reykjavik', position: new Vector3(-5.00, 5.00, 0), name: 'Reykjavik', size: 'small' },
  { id: 'trondheim', position: new Vector3(1.90,  4.15, 0), name: 'Trondheim', size: 'small' },
];

export const getCityPosition = (cityId: string): Vector3 => {
  const city = CITIES.find(c => c.id === cityId);
  if (!city) throw new Error(`City ${cityId} not found`);
  return city.position;
}; 