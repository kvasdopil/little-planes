import { Canvas, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import { Circle } from './Circle';
import { Line } from './Line';
import { Plane } from './Plane';
import { OrthographicCamera } from '@react-three/drei';
import { useState, useCallback, useEffect } from 'react';
import { Vector3, Mesh, PlaneGeometry } from 'three';

const SPACING = 2; // This will be about 20% of the screen with our camera setup
const PLANE_SPEED = 1.0; // Doubled speed for faster movement
const SPAWN_INTERVAL = 3000;

type Position = 'center' | 'top' | 'right' | 'bottom' | 'left';

interface Route {
  from: Position;
  to: Position;
}

interface PlaneInstance {
  id: number;
  route: Route;
  isReturning: boolean;
}

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

const routeExists = (routes: Route[], from: Position, to: Position): boolean => {
  return routes.some(
    route =>
      (route.from === from && route.to === to) || 
      (route.from === to && route.to === from)
  );
};

const Scene = () => {
  const [selectedCity, setSelectedCity] = useState<Position | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [planes, setPlanes] = useState<PlaneInstance[]>([]);
  const [nextPlaneId, setNextPlaneId] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(new Vector3());
  const { camera, size } = useThree();

  // Spawn new planes periodically
  useEffect(() => {
    if (routes.length === 0) return;

    const spawnPlane = () => {
      const randomRoute = routes[Math.floor(Math.random() * routes.length)];
      setPlanes(prev => [...prev, {
        id: nextPlaneId,
        route: randomRoute,
        isReturning: false
      }]);
      setNextPlaneId(prev => prev + 1);
    };

    const interval = setInterval(spawnPlane, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [routes, nextPlaneId]);

  const handlePlaneArrival = (planeId: number) => {
    setPlanes(prev => {
      const plane = prev.find(p => p.id === planeId);
      if (!plane) return prev;

      if (plane.isReturning) {
        // Remove plane if it completed return journey
        return prev.filter(p => p.id !== planeId);
      }

      // Create a new plane instance for the return journey
      return prev.map(p => 
        p.id === planeId ? { ...p, isReturning: true } : p
      );
    });
  };

  const handleSelect = (position: Position) => {
    if (!selectedCity) {
      // First city selected - enter edit mode
      setSelectedCity(position);
    } else if (selectedCity === position) {
      // Same city selected - exit edit mode
      setSelectedCity(null);
    } else {
      // Second city selected - create route if it doesn't exist
      if (!routeExists(routes, selectedCity, position)) {
        setRoutes(prev => [...prev, { from: selectedCity, to: position }]);
      }
      setSelectedCity(null);
    }
  };

  const handleBackgroundClick = (event: ThreeEvent<MouseEvent>) => {
    const mesh = event.object as Mesh;
    if (mesh.geometry instanceof PlaneGeometry) {
      setSelectedCity(null);
    }
  };

  const updateCursorPosition = useCallback((event: MouseEvent) => {
    const x = (event.clientX / size.width) * 2 - 1;
    const y = -(event.clientY / size.height) * 2 + 1;
    const vector = new Vector3(x, y, 0);
    vector.unproject(camera);
    setCursorPosition(vector);
  }, [camera, size]);

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

      {/* Render existing routes */}
      {routes.map((route, index) => (
        <Line
          key={`${route.from}-${route.to}-${index}`}
          start={getCirclePosition(route.from)}
          end={getCirclePosition(route.to)}
        />
      ))}

      {/* Render planes */}
      {planes.map((plane) => {
        const start = getCirclePosition(plane.isReturning ? plane.route.to : plane.route.from);
        const end = getCirclePosition(plane.isReturning ? plane.route.from : plane.route.to);
        return (
          <Plane
            key={`${plane.id}-${plane.isReturning}`}
            start={start}
            end={end}
            speed={PLANE_SPEED}
            onReachDestination={() => handlePlaneArrival(plane.id)}
          />
        );
      })}

      {/* Render route preview in edit mode */}
      {selectedCity && (
        <Line 
          start={getCirclePosition(selectedCity)} 
          end={cursorPosition}
        />
      )}

      {/* Center city */}
      <Circle 
        position={[0, 0, 0]} 
        isSelected={selectedCity === 'center'}
        onSelect={() => handleSelect('center')}
      />
      {/* Top city */}
      <Circle 
        position={[0, SPACING, 0]} 
        isSelected={selectedCity === 'top'}
        onSelect={() => handleSelect('top')}
      />
      {/* Right city */}
      <Circle 
        position={[SPACING, 0, 0]} 
        isSelected={selectedCity === 'right'}
        onSelect={() => handleSelect('right')}
      />
      {/* Bottom city */}
      <Circle 
        position={[0, -SPACING, 0]} 
        isSelected={selectedCity === 'bottom'}
        onSelect={() => handleSelect('bottom')}
      />
      {/* Left city */}
      <Circle 
        position={[-SPACING, 0, 0]} 
        isSelected={selectedCity === 'left'}
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
