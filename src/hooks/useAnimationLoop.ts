import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook for managing animation loop using requestAnimationFrame
 * @param callback Function to call on each animation frame
 */
export const useAnimationLoop = (callback: (time: number) => void) => {
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number>(0);

  const animate = useCallback(
    (time: number) => {
      // If this is the first frame, don't calculate elapsed time
      if (previousTimeRef.current === 0) {
        previousTimeRef.current = time;
      }

      // Call the callback with the current time
      callback(time);

      // Store time for next frame
      previousTimeRef.current = time;

      // Request next frame
      requestRef.current = requestAnimationFrame(animate);
    },
    [callback]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);

  return {
    stop: useCallback(() => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    }, []),
    start: useCallback(() => {
      if (!requestRef.current) {
        previousTimeRef.current = 0; // Reset time
        requestRef.current = requestAnimationFrame(animate);
      }
    }, [animate]),
  };
}; 