import { Html } from '@react-three/drei';
import { Vector3 } from 'three';
import { AirplaneModel } from '../../types/city';
import { useState } from 'react';

interface RouteConfirmationProps {
  position: Vector3;
  fromCity: string;
  toCity: string;
  onConfirm: (selectedAirplaneId: string) => void;
  onCancel: () => void;
  availableAirplanes: Array<{ id: string; model: AirplaneModel }>;
}

export const RouteConfirmation = ({
  position,
  fromCity,
  toCity,
  onConfirm,
  onCancel,
  availableAirplanes,
}: RouteConfirmationProps) => {
  // Get unique models and count available planes for each model
  const modelCounts = availableAirplanes.reduce<Record<AirplaneModel, number>>(
    (acc, airplane) => {
      acc[airplane.model] = (acc[airplane.model] || 0) + 1;
      return acc;
    },
    {} as Record<AirplaneModel, number>
  );

  const uniqueModels = Object.keys(modelCounts) as AirplaneModel[];

  // Initialize with the first available model
  const [selectedModel, setSelectedModel] = useState<AirplaneModel | ''>(uniqueModels[0] || '');

  const handleConfirm = () => {
    if (selectedModel) {
      // Find the first available airplane of the selected model
      const airplane = availableAirplanes.find((a) => a.model === selectedModel);
      if (airplane) {
        onConfirm(airplane.id);
      }
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
          color: '#333',
          width: '200px',
          textAlign: 'center',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
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

        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Create Route</h3>
        <div style={{ marginBottom: '20px', fontSize: '14px' }}>
          <div style={{ marginBottom: '8px' }}>From: {fromCity}</div>
          <div>To: {toCity}</div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Select Airplane</h4>
          {uniqueModels.length > 0 ? (
            <select
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              onChange={(e) => setSelectedModel(e.target.value as AirplaneModel)}
              value={selectedModel}
            >
              {uniqueModels.map((model) => (
                <option key={model} value={model}>
                  {model} ({modelCounts[model]} available)
                </option>
              ))}
            </select>
          ) : (
            <p style={{ color: 'red', fontSize: '14px' }}>No available airplanes in {fromCity}</p>
          )}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedModel}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: selectedModel ? '#4CAF50' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedModel ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (selectedModel) {
              e.currentTarget.style.backgroundColor = '#45a049';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedModel) {
              e.currentTarget.style.backgroundColor = '#4CAF50';
            }
          }}
        >
          Create Route
        </button>
      </div>
    </Html>
  );
};
