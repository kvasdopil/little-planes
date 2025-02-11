import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { City } from './City';
import { Line } from './Line';
import Plane from './Plane';
import { OrthographicCamera, MapControls } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import { Vector3, Mesh, PlaneGeometry, Box3 } from 'three';
import { CityId, AvailableAirplane } from '../../types/city';
import { CITIES, getCityPosition } from '../../constants/cities';
import { RouteConfirmation } from './RouteConfirmation';
import { CityInfo } from './CityInfo';

const PLANE_SPEED = 2.0; // Units per second
const VIEWPORT_MARGIN = 0.8; // 80% of viewport

interface Route {
  from: CityId;
  to: CityId;
  assignedAirplaneId: string;
}

interface Flight {
  id: number;
  route: Route;
  isReturning: boolean;
  airplane: AvailableAirplane;
  startTime: number;
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

class FlightController {
  private startTime: number;
  private cancelled: boolean = false;
  private flightDuration: number;
  private animationFrameId: number | null = null;

  constructor(
    private start: Vector3,
    private end: Vector3,
    private speed: number,
    private onProgress: (position: Vector3) => void,
    private onComplete: () => void
  ) {
    const totalDistance = end.clone().sub(start).length();
    this.flightDuration = (totalDistance / speed) * 1000;
    this.startTime = performance.now();
    this.startFlight();
  }

  private startFlight = () => {
    const animate = () => {
      if (this.cancelled) return;

      const progress = Math.min((performance.now() - this.startTime) / this.flightDuration, 1);
      const currentPosition = this.start.clone().lerp(this.end, progress);
      this.onProgress(currentPosition);

      if (progress >= 1) {
        this.onComplete();
        return;
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  };

  public cancel() {
    this.cancelled = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

export const GameScene = () => {
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  // Add money state
  const [money, setMoney] = useState(0);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
          setMoney={setMoney}
        />
      </Canvas>
      {/* Money counter overlay */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          fontSize: '20px',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '5px 10px',
          borderRadius: '5px',
          zIndex: 100,
        }}
      >
        $ {money}
      </div>
    </div>
  );
};

interface SceneProps {
  onRouteCreateStart: () => void;
  onRouteCreateEnd: () => void;
  setMoney: (value: number | ((prev: number) => number)) => void;
}

const Scene = ({ onRouteCreateStart, onRouteCreateEnd, setMoney }: SceneProps) => {
  const { camera, size, gl } = useThree();
  const [selectedCity, setSelectedCity] = useState<CityId | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [planes, setPlanes] = useState<Flight[]>([]);
  const nextPlaneIdRef = useRef(0);
  const flightControllersRef = useRef<Map<number, FlightController>>(new Map());
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

  const startNewFlight = (flight: Flight) => {
    const start = getCityPosition(flight.isReturning ? flight.route.to : flight.route.from);
    const end = getCityPosition(flight.isReturning ? flight.route.from : flight.route.to);

    // Cancel existing flight controller if it exists
    const existingController = flightControllersRef.current.get(flight.id);
    if (existingController) {
      existingController.cancel();
    }

    const controller = new FlightController(
      start,
      end,
      PLANE_SPEED,
      () => {}, // No need for progress updates anymore
      () => handlePlaneArrival(flight.id)
    );

    flightControllersRef.current.set(flight.id, controller);
  };

  const createNewFlight = (route: Route, airplane: AvailableAirplane, isReturning: boolean = false) => {
    const newId = nextPlaneIdRef.current++;
    
    const newFlight: Flight = {
      id: newId,
      route,
      isReturning,
      airplane,
      startTime: performance.now(),
    };

    setPlanes(prev => [...prev, newFlight]);
    startNewFlight(newFlight);
  };

  const handlePlaneArrival = (planeId: number) => {
    setMoney((prev) => prev + 100);
    
    setPlanes((prev) => {
      const planeIndex = prev.findIndex((p) => p.id === planeId);
      if (planeIndex === -1) return prev;

      const plane = prev[planeIndex];
      const newId = nextPlaneIdRef.current++;

      const newFlight: Flight = {
        id: newId,
        route: plane.route,
        isReturning: !plane.isReturning,
        airplane: plane.airplane,
        startTime: performance.now(),
      };

      // Remove old flight controller
      flightControllersRef.current.delete(planeId);

      // Start the new flight after a short delay to ensure clean transition
      setTimeout(() => startNewFlight(newFlight), 0);

      return prev.map(p => p.id === planeId ? newFlight : p);
    });
  };

  // Cleanup flight controllers on unmount
  useEffect(() => {
    return () => {
      flightControllersRef.current.forEach(controller => controller.cancel());
      flightControllersRef.current.clear();
    };
  }, []);

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

  const handleRouteConfirm = (selectedAirplaneId: string) => {
    if (pendingRoute) {
      // Update the airplane's assigned status
      const fromCity = CITIES.find((c) => c.id === pendingRoute.from)!;
      const airplane = fromCity.availableAirplanes.find((a) => a.id === selectedAirplaneId)!;
      airplane.isAssigned = true;

      // Create the route with the assigned airplane
      const newRoute = { 
        from: pendingRoute.from, 
        to: pendingRoute.to, 
        assignedAirplaneId: selectedAirplaneId 
      };
      setRoutes((prev) => [...prev, newRoute]);

      // Immediately create the first flight for this route
      createNewFlight(newRoute, airplane, false);

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
    // Only handle clicks on the background plane
    const clickedObject = event.object;
    if (clickedObject instanceof Mesh && clickedObject.geometry instanceof PlaneGeometry) {
      setSelectedCity(null);
      setPendingRoute(null);
      setCityInfo(null);
    }
  };

  // Replace useFrame mouse listener with useEffect
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;
      const vector = new Vector3(x, y, 0);
      vector.unproject(camera);
      setCursorPosition(vector);
    };
    
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl.domElement, camera, size]);

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
          availableAirplanes={CITIES.find((c) => c.id === pendingRoute.from)!.availableAirplanes.filter((a) => !a.isAssigned)}
        />
      )}

      {/* Render city info popup */}
      {cityInfo && !pendingRoute && (
        <CityInfo
          position={cityInfo.position}
          cityName={CITIES.find((c) => c.id === cityInfo.id)!.name}
          onClose={handleCityInfoClose}
          availableAirplanes={CITIES.find((c) => c.id === cityInfo.id)!.availableAirplanes}
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
      {planes.map((flight) => (
        <Plane
          key={`${flight.id}`}
          start={getCityPosition(flight.isReturning ? flight.route.to : flight.route.from)}
          end={getCityPosition(flight.isReturning ? flight.route.from : flight.route.to)}
          model={flight.airplane.model}
          startTime={flight.startTime}
          speed={PLANE_SPEED}
        />
      ))}
    </>
  );
};
