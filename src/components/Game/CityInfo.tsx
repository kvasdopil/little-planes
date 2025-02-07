import { Html } from '@react-three/drei';
import { Vector3 } from 'three';

interface CityInfoProps {
  position: Vector3;
  onClose: () => void;
  cityName: string;
}

export const CityInfo = ({ position, onClose, cityName }: CityInfoProps) => {
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div
        style={{
          pointerEvents: 'auto',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '200px',
          color: '#333',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
        }}
        onClick={handleBackgroundClick}
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

        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>{cityName}</h3>
        </div>

        <div style={{ marginBottom: '20px', fontSize: '14px' }}>
          <div style={{ marginBottom: '8px' }}>Population: 1.2M</div>
          <div style={{ marginBottom: '8px' }}>Active Routes: 3</div>
          <div>Planes in transit: 2</div>
        </div>

        <button
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1976D2')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2196F3')}
        >
          View Details
        </button>
      </div>
    </Html>
  );
};
