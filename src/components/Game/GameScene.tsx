import { Canvas, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import { City } from './City';
import { Line } from './Line';
import { Plane } from './Plane';
import { OrthographicCamera, MapControls } from '@react-three/drei';
import { useState, useCallback, useEffect } from 'react';
import { Vector3, Mesh, PlaneGeometry, Box3 } from 'three';
import { CityId } from '../../types/city';
import { CITIES, getCityPosition } from '../../constants/cities';
import { RouteConfirmation } from './RouteConfirmation';
import { CityInfo } from './CityInfo';

const PLANE_SPEED = 2.0; // Units per second
const SPAWN_INTERVAL = 1000; // Spawn a new plane every second
const VIEWPORT_MARGIN = 0.8; // 80% of viewport

interface Route {
  from: CityId;
  to: CityId;
}

interface PlaneInstance {
  id: number;
  route: Route;
  isReturning: boolean;
}

interface PendingRoute {
  from: CityId;
  to: CityId;
  position: Vector3;
}

interface SelectedCityInfo {
  id: CityId;
  position: Vector3;
}

const routeExists = (routes: Route[], from: CityId, to: CityId): boolean => {
  return routes.some(
    (route) => (route.from === from && route.to === to) || (route.from === to && route.to === from)
  );
};

// Calculate bounds of all cities
const calculateCitiesBounds = () => {
  const box = new Box3();
  CITIES.forEach((city) => {
    box.expandByPoint(city.position);
  });
  return box;
};

// Add initial zoom calculation as a constant at the top
const calculateInitialZoom = () => {
  const bounds = calculateCitiesBounds();
  const size = new Vector3();
  bounds.getSize(size);
  return Math.min(
    (window.innerWidth * VIEWPORT_MARGIN) / size.x,
    (window.innerHeight * VIEWPORT_MARGIN) / size.y
  );
};

const INITIAL_ZOOM = calculateInitialZoom();

export const GameScene = () => {
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas>
        <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={INITIAL_ZOOM} />
        <MapControls
          enableRotate={false}
          enablePan={!isCreatingRoute}
          enableZoom={!isCreatingRoute}
          screenSpacePanning={true}
          panSpeed={1.0}
          zoomSpeed={0.3}
          minZoom={INITIAL_ZOOM * 0.2}
          maxZoom={INITIAL_ZOOM * 3}
          dampingFactor={0.1}
        />
        <Scene
          onRouteCreateStart={() => setIsCreatingRoute(true)}
          onRouteCreateEnd={() => setIsCreatingRoute(false)}
        />
      </Canvas>
    </div>
  );
};

interface SceneProps {
  onRouteCreateStart: () => void;
  onRouteCreateEnd: () => void;
}

const Scene = ({ onRouteCreateStart, onRouteCreateEnd }: SceneProps) => {
  const { camera, size } = useThree();
  const [selectedCity, setSelectedCity] = useState<CityId | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [planes, setPlanes] = useState<PlaneInstance[]>([]);
  const [nextPlaneId, setNextPlaneId] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(new Vector3());
  const [pendingRoute, setPendingRoute] = useState<PendingRoute | null>(null);
  const [cityInfo, setCityInfo] = useState<SelectedCityInfo | null>(null);
  const [dragTargetCity, setDragTargetCity] = useState<CityId | null>(null);

  // Set initial camera position and zoom
  useEffect(() => {
    const bounds = calculateCitiesBounds();
    const center = new Vector3();
    bounds.getCenter(center);

    camera.position.set(center.x, center.y, 5);
    camera.zoom = INITIAL_ZOOM;
    camera.updateProjectionMatrix();
  }, [camera]);

  // Spawn new planes periodically
  useEffect(() => {
    if (routes.length === 0) return;

    const spawnPlane = () => {
      const randomRoute = routes[Math.floor(Math.random() * routes.length)];
      setPlanes((prev) => [
        ...prev,
        {
          id: nextPlaneId,
          route: randomRoute,
          isReturning: false,
        },
      ]);
      setNextPlaneId((prev) => prev + 1);
    };

    const interval = setInterval(spawnPlane, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [routes, nextPlaneId]);

  const handlePlaneArrival = (planeId: number) => {
    setPlanes((prev) => {
      const plane = prev.find((p) => p.id === planeId);
      if (!plane) return prev;

      if (plane.isReturning) {
        // Remove plane if it completed return journey
        return prev.filter((p) => p.id !== planeId);
      }

      // Create a new plane instance for the return journey
      return prev.map((p) => (p.id === planeId ? { ...p, isReturning: true } : p));
    });
  };

  const handleSelect = (cityId: CityId) => {
    // Only show city info if not creating a route
    if (!selectedCity || selectedCity === cityId) {
      const city = CITIES.find((c) => c.id === cityId)!;
      setCityInfo({
        id: cityId,
        position: city.position.clone(),
      });
      setSelectedCity(null);
    }
  };

  const handleDragOver = (cityId: CityId) => {
    if (selectedCity && selectedCity !== cityId && !routeExists(routes, selectedCity, cityId)) {
      setDragTargetCity(cityId);
    }
  };

  const handleDragStart = (cityId: CityId) => {
    setSelectedCity(cityId);
    setCityInfo(null);
    setPendingRoute(null);
    setDragTargetCity(null);
    onRouteCreateStart();
  };

  const handleDragEnd = () => {
    if (
      selectedCity &&
      dragTargetCity &&
      selectedCity !== dragTargetCity &&
      !routeExists(routes, selectedCity, dragTargetCity)
    ) {
      const fromCity = CITIES.find((c) => c.id === selectedCity)!;
      const toCity = CITIES.find((c) => c.id === dragTargetCity)!;
      const midPoint = fromCity.position.clone().add(toCity.position).multiplyScalar(0.5);

      const newPendingRoute = {
        from: selectedCity,
        to: dragTargetCity,
        position: midPoint,
      };

      setTimeout(() => {
        setPendingRoute(newPendingRoute);
      }, 0);

      setDragTargetCity(null);
    } else {
      setPendingRoute(null);
      setSelectedCity(null);
      setDragTargetCity(null);
      onRouteCreateEnd();
    }
  };

  const handleRouteConfirm = () => {
    if (pendingRoute) {
      setRoutes((prev) => [...prev, { from: pendingRoute.from, to: pendingRoute.to }]);
      setPendingRoute(null);
      setSelectedCity(null);
      setDragTargetCity(null);
      onRouteCreateEnd();
    }
  };

  const handleRouteCancel = () => {
    setPendingRoute(null);
    setSelectedCity(null);
    setDragTargetCity(null);
    onRouteCreateEnd();
  };

  const handleCityInfoClose = () => {
    setCityInfo(null);
    setSelectedCity(null);
  };

  const handleBackgroundClick = (event: ThreeEvent<MouseEvent>) => {
    const mesh = event.object as Mesh;
    if (mesh.geometry instanceof PlaneGeometry) {
      setSelectedCity(null);
      setPendingRoute(null);
      setCityInfo(null);
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

      {/* Render route preview */}
      {pendingRoute && (
        <Line start={getCityPosition(pendingRoute.from)} end={getCityPosition(pendingRoute.to)} />
      )}

      {/* Render route preview in edit mode */}
      {selectedCity && !pendingRoute && (
        <Line start={getCityPosition(selectedCity)} end={cursorPosition} />
      )}

      {/* Render route confirmation popup */}
      {pendingRoute && pendingRoute.position && (
        <RouteConfirmation
          key={`${pendingRoute.from}-${pendingRoute.to}`}
          position={pendingRoute.position}
          fromCity={CITIES.find((c) => c.id === pendingRoute.from)!.name}
          toCity={CITIES.find((c) => c.id === pendingRoute.to)!.name}
          onConfirm={handleRouteConfirm}
          onCancel={handleRouteCancel}
        />
      )}

      {/* Render city info popup */}
      {cityInfo && !pendingRoute && (
        <CityInfo
          position={cityInfo.position}
          cityName={CITIES.find((c) => c.id === cityInfo.id)!.name}
          onClose={handleCityInfoClose}
        />
      )}

      {/* Render cities */}
      {CITIES.map((city) => (
        <City
          key={city.id}
          id={city.id}
          position={[city.position.x, city.position.y, city.position.z]}
          isSelected={selectedCity === city.id}
          onSelect={() => handleSelect(city.id)}
          name={city.name}
          size={city.size}
          onDragStart={(cityId) => handleDragStart(cityId)}
          onDragOver={(cityId) => handleDragOver(cityId)}
          onDragEnd={handleDragEnd}
          isDraggingActive={selectedCity !== null}
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
    </>
  );
};
