import { City } from './City';
import { CityLabel } from './CityLabel';

interface CitiesProps {
  onCityMouseDown: (city: CityModel) => void;
  onCityMouseUp: (city: CityModel) => void;
  selectedCity: CityModel | null;
}

export interface CityModel {
  name: string;
  latitude: number;
  longitude: number;
}

const MAJOR_EUROPEAN_CITIES: CityModel[] = [
  { name: 'Istanbul', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Moscow', latitude: 55.7558, longitude: 37.6173 },
  { name: 'London', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Saint Petersburg', latitude: 59.9343, longitude: 30.3351 },
  { name: 'Berlin', latitude: 52.52, longitude: 13.405 },
  { name: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Rome', latitude: 41.9028, longitude: 12.4964 },
  { name: 'Kiev', latitude: 50.4501, longitude: 30.5234 },
  { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Minsk', latitude: 53.9006, longitude: 27.559 },
];

const CITY_SIZE = 0.02;

export function Cities({ onCityMouseDown, onCityMouseUp, selectedCity }: CitiesProps) {
  return (
    <>
      {MAJOR_EUROPEAN_CITIES.map((city) => (
        <City
          key={city.name}
          name={city.name}
          latitude={city.latitude}
          longitude={city.longitude}
          size={CITY_SIZE}
          onMouseDown={() => onCityMouseDown(city)}
          onMouseUp={() => onCityMouseUp(city)}
          isSelected={selectedCity === city}
        >
          <CityLabel name={city.name} />
        </City>
      ))}
    </>
  );
}
