import { Html } from '@react-three/drei';
import { Vector3 } from 'three';
import { AvailableAirplane } from '../../types/city';

interface CityInfoProps {
  position: Vector3;
  cityName: string;
  onClose: () => void;
  availableAirplanes: AvailableAirplane[];
}

export const CityInfo = ({ position, cityName, onClose, availableAirplanes }: CityInfoProps) => {
  // Count available airplanes by model
  const airplaneCounts = availableAirplanes.reduce<Record<string, number>>((acc, airplane) => {
    if (!airplane.isAssigned) {
      acc[airplane.model] = (acc[airplane.model] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div
        style={{
          pointerEvents: 'auto',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          color: '#333',
          width: '200px',
          textAlign: 'center',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-12px',
            right: '-12px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#333',
            border: '2px solid white',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            padding: 0,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          ×
        </button>

        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>{cityName}</h3>
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Available Airplanes</h4>
          {Object.entries(airplaneCounts).length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px' }}>
              {Object.entries(airplaneCounts).map(([model, count]) => (
                <li key={model} style={{ marginBottom: '8px' }}>
                  {model}: {count} available
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'red', fontSize: '14px' }}>No available airplanes</p>
          )}
        </div>
      </div>
    </Html>
  );
};
