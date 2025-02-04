import { Canvas, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import { Circle } from './Circle';
import { Line } from './Line';
import { OrthographicCamera } from '@react-three/drei';
import { useState, useCallback } from 'react';
import { Vector3, Mesh, PlaneGeometry } from 'three';

const SPACING = 2; // This will be about 20% of the screen with our camera setup

type Position = 'center' | 'top' | 'right' | 'bottom' | 'left';

const getCirclePosition = (position: Position): Vector3 => {
  switch (position) {
    case 'center':
      return new Vector3(0, 0, 0);
    case 'top':
      return new Vector3(0, SPACING, 0);
    case 'right':
      return new Vector3(SPACING, 0, 0);
    case 'bottom':
      return new Vector3(0, -SPACING, 0);
    case 'left':
      return new Vector3(-SPACING, 0, 0);
  }
};

const Scene = () => {
  const [selectedCircle, setSelectedCircle] = useState<Position | null>(null);
  const [cursorPosition, setCursorPosition] = useState(new Vector3());
  const { camera, size } = useThree();

  const handleSelect = (position: Position) => {
    setSelectedCircle(position === selectedCircle ? null : position);
  };

  const handleBackgroundClick = (event: ThreeEvent<MouseEvent>) => {
    const mesh = event.object as Mesh;
    if (mesh.geometry instanceof PlaneGeometry) {
      setSelectedCircle(null);
    }
  };

  const updateCursorPosition = useCallback(
    (event: MouseEvent) => {
      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;
      const vector = new Vector3(x, y, 0);
      vector.unproject(camera);
      setCursorPosition(vector);
    },
    [camera, size]
  );

  useFrame(({ gl }) => {
    gl.domElement.addEventListener('mousemove', updateCursorPosition);
    return () => {
      gl.domElement.removeEventListener('mousemove', updateCursorPosition);
    };
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={100} />
      <color attach="background" args={['black']} />

      {/* Invisible plane for background clicks */}
      <mesh position={[0, 0, -1]} onClick={handleBackgroundClick}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Render line if there's a selected circle */}
      {selectedCircle && <Line start={getCirclePosition(selectedCircle)} end={cursorPosition} />}

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
    </>
  );
};

export const GameScene = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  );
};
