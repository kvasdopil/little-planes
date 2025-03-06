import { City } from './City';
import { CityLabel } from './CityLabel';

interface CitiesProps {
  onCityClick: (latitude: number, longitude: number) => void;
  onCityMouseDown?: (latitude: number, longitude: number) => void;
  selectedCity?: { latitude: number; longitude: number } | null;
}

const MAJOR_EUROPEAN_CITIES = [
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

export function Cities({ onCityClick, onCityMouseDown, selectedCity }: CitiesProps) {
  // Helper function to check if a city is selected
  const isCitySelected = (latitude: number, longitude: number) => {
    if (!selectedCity) return false;

    // Account for the longitude fix that's applied in the City component
    const adjustedLongitude = longitude + 90;

    return selectedCity.latitude === latitude && selectedCity.longitude === adjustedLongitude;
  };

  return (
    <>
      {MAJOR_EUROPEAN_CITIES.map((city) => (
        <City
          key={city.name}
          name={city.name}
          latitude={city.latitude}
          longitude={city.longitude}
          size={CITY_SIZE}
          onClick={onCityClick}
          onMouseDown={onCityMouseDown}
          isSelected={isCitySelected(city.latitude, city.longitude)}
        >
          <CityLabel name={city.name} />
        </City>
      ))}
    </>
  );
}
