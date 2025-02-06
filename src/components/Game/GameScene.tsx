import { Canvas, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import { City } from './City';
import { Line } from './Line';
import { Plane } from './Plane';
import { OrthographicCamera } from '@react-three/drei';
import { useState, useCallback, useEffect } from 'react';
import { Vector3, Mesh, PlaneGeometry } from 'three';

const SPACING = 2; // This will be about 20% of the screen with our camera setup
const PLANE_SPEED = 1.0; // Doubled speed for faster movement
const SPAWN_INTERVAL = 1000; // Spawn a new plane every second

interface CityData {
  id: string;
  position: Vector3;
  name: string;
}

const CITIES: CityData[] = [
  { id: 'center', position: new Vector3(0, 0, 0), name: 'Central Hub' },
  { id: 'north', position: new Vector3(0, SPACING, 0), name: 'North City' },
  { id: 'east', position: new Vector3(SPACING, 0, 0), name: 'East City' },
  { id: 'south', position: new Vector3(0, -SPACING, 0), name: 'South City' },
  { id: 'west', position: new Vector3(-SPACING, 0, 0), name: 'West City' },
];

interface Route {
  from: string;
  to: string;
}

interface PlaneInstance {
  id: number;
  route: Route;
  isReturning: boolean;
}

const getCityPosition = (cityId: string): Vector3 => {
  const city = CITIES.find(c => c.id === cityId);
  if (!city) throw new Error(`City ${cityId} not found`);
  return city.position;
};

const routeExists = (routes: Route[], from: string, to: string): boolean => {
  return routes.some(
    route =>
      (route.from === from && route.to === to) || 
      (route.from === to && route.to === from)
  );
};

const Scene = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
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

  const handleSelect = (cityId: string) => {
    if (!selectedCity) {
      // First city selected - enter edit mode
      setSelectedCity(cityId);
    } else if (selectedCity === cityId) {
      // Same city selected - exit edit mode
      setSelectedCity(null);
    } else {
      // Second city selected - create route if it doesn't exist
      if (!routeExists(routes, selectedCity, cityId)) {
        setRoutes(prev => [...prev, { from: selectedCity, to: cityId }]);
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
          start={getCityPosition(route.from)}
          end={getCityPosition(route.to)}
        />
      ))}

      {/* Render planes */}
      {planes.map((plane) => {
        const start = getCityPosition(plane.isReturning ? plane.route.to : plane.route.from);
        const end = getCityPosition(plane.isReturning ? plane.route.from : plane.route.to);
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
          start={getCityPosition(selectedCity)} 
          end={cursorPosition}
        />
      )}

      {/* Render cities */}
      {CITIES.map((city) => (
        <City 
          key={city.id}
          position={[city.position.x, city.position.y, city.position.z]}
          isSelected={selectedCity === city.id}
          onSelect={() => handleSelect(city.id)}
          name={city.name}
        />
      ))}
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
