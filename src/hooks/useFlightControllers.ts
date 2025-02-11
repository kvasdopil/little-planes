import { useRef, useEffect } from 'react';
import { Vector3 } from 'three';
import { FlightController } from '../controllers/FlightController';
import { Flight } from '../types/game';
import { getCityPosition } from '../constants/cities';

export const useFlightControllers = (onPlaneArrival: (planeId: number) => void) => {
  const flightControllersRef = useRef<Map<number, FlightController>>(new Map());

  const createFlightController = (flight: Flight, speed: number) => {
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
      speed,
      () => {}, // No need for progress updates
      () => onPlaneArrival(flight.id)
    );

    flightControllersRef.current.set(flight.id, controller);
  };

  const removeFlightController = (flightId: number) => {
    const controller = flightControllersRef.current.get(flightId);
    if (controller) {
      controller.cancel();
      flightControllersRef.current.delete(flightId);
    }
  };

  // Cleanup flight controllers on unmount
  useEffect(() => {
    return () => {
      flightControllersRef.current.forEach(controller => controller.cancel());
      flightControllersRef.current.clear();
    };
  }, []);

  return {
    createFlightController,
    removeFlightController,
  };
}; 