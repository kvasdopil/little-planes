import { Canvas } from '@react-three/fiber';
import { Circle } from './Circle';
import { OrthographicCamera } from '@react-three/drei';
import { useState } from 'react';

const SPACING = 2; // This will be about 20% of the screen with our camera setup

type Position = 'center' | 'top' | 'right' | 'bottom' | 'left';

export const GameScene = () => {
  const [selectedCircle, setSelectedCircle] = useState<Position | null>(null);

  const handleSelect = (position: Position) => {
    setSelectedCircle(position === selectedCircle ? null : position);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        onCreated={({ gl }) => {
          gl.domElement.style.cursor = 'auto';
        }}
      >
        <color attach="background" args={['black']} />
        <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={100} />
        {/* Center circle */}
        <Circle 
          position={[0, 0, 0]} 
          isSelected={selectedCircle === 'center'}
          onSelect={() => handleSelect('center')}
        />
        {/* Top circle */}
        <Circle 
          position={[0, SPACING, 0]} 
          isSelected={selectedCircle === 'top'}
          onSelect={() => handleSelect('top')}
        />
        {/* Right circle */}
        <Circle 
          position={[SPACING, 0, 0]} 
          isSelected={selectedCircle === 'right'}
          onSelect={() => handleSelect('right')}
        />
        {/* Bottom circle */}
        <Circle 
          position={[0, -SPACING, 0]} 
          isSelected={selectedCircle === 'bottom'}
          onSelect={() => handleSelect('bottom')}
        />
        {/* Left circle */}
        <Circle 
          position={[-SPACING, 0, 0]} 
          isSelected={selectedCircle === 'left'}
          onSelect={() => handleSelect('left')}
        />
      </Canvas>
    </div>
  );
}; 