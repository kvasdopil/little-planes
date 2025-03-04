import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { ANIMATION_CONSTANTS, DEFAULT_CAMERA_POSITION } from '../utils/constants';
import { getNormalizedMousePosition } from '../utils/coordinates';

interface EarthRotationProps {
  horizontalPivot: THREE.Object3D | null;
  verticalPivot: THREE.Object3D | null;
  scene: THREE.Scene | null;
  earth: THREE.Mesh | null;
  camera: THREE.PerspectiveCamera | null;
  domElement: HTMLCanvasElement | null;
}

interface RotationState {
  targetRotationY: number;
  currentRotationY: number;
  targetRotationX: number;
  currentRotationX: number;
  rotationVelocityY: number;
  rotationVelocityX: number;
  isInFlyToAnimation: boolean;
  flyToDuration: number;
}

export interface EarthRotationResult {
  rotationStateRef: React.MutableRefObject<RotationState>;
  isDraggingRef: React.MutableRefObject<boolean>;
  intersectionPointRef: React.MutableRefObject<THREE.Vector3 | null>;
  previousMousePositionRef: React.MutableRefObject<{ x: number; y: number }>;
  lastDragTimeRef: React.MutableRefObject<number>;
  previousAngleRef: React.MutableRefObject<number>;
  previousVerticalPositionRef: React.MutableRefObject<number>;
  dragStartPointRef: React.MutableRefObject<THREE.Vector3 | null>;
  movementTrackingRef: React.MutableRefObject<{ x: number[]; y: number[] }>;
  updateTargetRotation: (horizontalTarget: number, verticalTarget: number) => void;
  handleMouseDown: (event: MouseEvent | React.MouseEvent<HTMLElement>) => void;
  handleMouseMove: (event: MouseEvent | React.MouseEvent<HTMLElement>) => void;
  handleMouseUp: () => void;
  updateRotation: () => void;
}

/**
 * Hook for handling Earth rotation
 */
export const useEarthRotation = ({
  horizontalPivot,
  verticalPivot,
  scene,
  earth,
  camera,
  domElement,
}: EarthRotationProps): EarthRotationResult => {
  // References for tracking rotation states
  const isDraggingRef = useRef<boolean>(false);
  const intersectionPointRef = useRef<THREE.Vector3 | null>(null);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const lastDragTimeRef = useRef<number>(0);
  const previousAngleRef = useRef<number>(0);
  const previousVerticalPositionRef = useRef<number>(0);
  const dragStartPointRef = useRef<THREE.Vector3 | null>(null);
  const movementTrackingRef = useRef<{ x: number[]; y: number[] }>({ x: [], y: [] });

  // Rotation state
  const rotationStateRef = useRef<RotationState>({
    targetRotationY: DEFAULT_CAMERA_POSITION.HORIZONTAL_ROTATION,
    currentRotationY: DEFAULT_CAMERA_POSITION.HORIZONTAL_ROTATION,
    targetRotationX: DEFAULT_CAMERA_POSITION.VERTICAL_ROTATION,
    currentRotationX: DEFAULT_CAMERA_POSITION.VERTICAL_ROTATION,
    rotationVelocityY: 0,
    rotationVelocityX: 0,
    isInFlyToAnimation: false,
    flyToDuration: 0,
  });

  /**
   * Update the target rotation of the Earth
   */
  const updateTargetRotation = useCallback(
    (horizontalTarget: number, verticalTarget: number) => {
      if (rotationStateRef.current.isInFlyToAnimation) return;

      rotationStateRef.current.targetRotationY = horizontalTarget;
      rotationStateRef.current.targetRotationX = verticalTarget;
      rotationStateRef.current.isInFlyToAnimation = true;
      rotationStateRef.current.flyToDuration = ANIMATION_CONSTANTS.TOTAL_FLY_TO_DURATION;
    },
    []
  );

  /**
   * Handle mouse down event to start dragging
   */
  const handleMouseDown = useCallback(
    (event: MouseEvent | React.MouseEvent<HTMLElement>) => {
      if (!earth || !scene || !camera) return;

      // Prevent animation while dragging
      rotationStateRef.current.isInFlyToAnimation = false;

      // Set dragging state
      isDraggingRef.current = true;

      // Get mouse position
      const mousePosition = getNormalizedMousePosition(event, domElement || undefined);
      previousMousePositionRef.current = mousePosition;

      // Create raycaster to detect intersection with Earth
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(
        new THREE.Vector2(mousePosition.x, mousePosition.y),
        camera
      );

      // Find intersection with Earth
      const intersects = raycaster.intersectObject(earth);
      if (intersects.length > 0) {
        intersectionPointRef.current = intersects[0].point;
        dragStartPointRef.current = intersects[0].point.clone();

        // Calculate angle for horizontal rotation
        const xzProjection = new THREE.Vector3(
          intersects[0].point.x,
          0,
          intersects[0].point.z
        ).normalize();
        const angle = Math.atan2(xzProjection.z, xzProjection.x);
        previousAngleRef.current = angle;

        // Save vertical position for vertical rotation
        previousVerticalPositionRef.current = intersects[0].point.y;
      }

      // Reset movement tracking
      movementTrackingRef.current = { x: [], y: [] };
    },
    [earth, scene, camera, domElement]
  );

  /**
   * Handle mouse move event for dragging
   */
  const handleMouseMove = useCallback(
    (event: MouseEvent | React.MouseEvent<HTMLElement>) => {
      if (!isDraggingRef.current || !intersectionPointRef.current || !earth || !scene || !camera) return;

      // Get mouse position
      const mousePosition = getNormalizedMousePosition(event, domElement || undefined);

      // Create raycaster to detect intersection with Earth
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(
        new THREE.Vector2(mousePosition.x, mousePosition.y),
        camera
      );

      // Find intersection with Earth
      const intersects = raycaster.intersectObject(earth);
      if (intersects.length > 0) {
        const currentPoint = intersects[0].point;

        // Calculate angle for horizontal rotation
        const xzProjection = new THREE.Vector3(currentPoint.x, 0, currentPoint.z).normalize();
        const angle = Math.atan2(xzProjection.z, xzProjection.x);
        
        // Calculate angle difference for rotation
        let angleDiff = angle - previousAngleRef.current;
        
        // Normalize angle difference
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // Update target horizontal rotation
        rotationStateRef.current.targetRotationY += angleDiff;
        previousAngleRef.current = angle;

        // Calculate vertical rotation based on y-coordinate difference
        const verticalDiff = currentPoint.y - previousVerticalPositionRef.current;
        rotationStateRef.current.targetRotationX += verticalDiff * ANIMATION_CONSTANTS.ROTATION_SPEED;
        previousVerticalPositionRef.current = currentPoint.y;

        // Track movement for inertia
        const now = Date.now();
        if (lastDragTimeRef.current > 0) {
          const timeDelta = now - lastDragTimeRef.current;
          if (timeDelta > 0) {
            // Track last few movements for calculating inertia
            movementTrackingRef.current.x.push(angleDiff / timeDelta);
            movementTrackingRef.current.y.push(verticalDiff / timeDelta);
            
            // Keep only last 5 movements
            if (movementTrackingRef.current.x.length > 5) {
              movementTrackingRef.current.x.shift();
              movementTrackingRef.current.y.shift();
            }
          }
        }
        lastDragTimeRef.current = now;
      }

      // Update previous mouse position
      previousMousePositionRef.current = mousePosition;
    },
    [earth, scene, camera, domElement]
  );

  /**
   * Handle mouse up event to end dragging
   */
  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    intersectionPointRef.current = null;
    dragStartPointRef.current = null;

    // Calculate inertia based on recent movements
    if (movementTrackingRef.current.x.length > 0) {
      const avgXVelocity =
        movementTrackingRef.current.x.reduce((sum, val) => sum + val, 0) /
        movementTrackingRef.current.x.length;
      
      const avgYVelocity =
        movementTrackingRef.current.y.reduce((sum, val) => sum + val, 0) /
        movementTrackingRef.current.y.length;

      // Set initial velocity for inertia
      rotationStateRef.current.rotationVelocityY = avgXVelocity * 20; // Scale factor for better feel
      rotationStateRef.current.rotationVelocityX = avgYVelocity * 20;
    }
  }, []);

  /**
   * Update the rotation based on current state
   */
  const updateRotation = useCallback(() => {
    if (!horizontalPivot || !verticalPivot) return;

    const {
      targetRotationY,
      currentRotationY,
      targetRotationX,
      currentRotationX,
      rotationVelocityY,
      rotationVelocityX,
      isInFlyToAnimation,
      flyToDuration,
    } = rotationStateRef.current;

    let newRotationY = currentRotationY;
    let newRotationX = currentRotationX;
    let newVelocityY = rotationVelocityY;
    let newVelocityX = rotationVelocityX;
    let newIsInFlyToAnimation = isInFlyToAnimation;
    let newFlyToDuration = flyToDuration;

    if (isInFlyToAnimation) {
      // Smooth animation to target rotation
      const remainingDuration = Math.max(0, newFlyToDuration - 1);
      
      // Use smoothing for fly-to animation
      newRotationY = currentRotationY + (targetRotationY - currentRotationY) * ANIMATION_CONSTANTS.FLY_TO_SMOOTHING_FACTOR;
      newRotationX = currentRotationX + (targetRotationX - currentRotationX) * ANIMATION_CONSTANTS.FLY_TO_SMOOTHING_FACTOR;
      
      // Update duration
      newFlyToDuration = remainingDuration;
      
      // End animation if we're close enough to target
      if (
        Math.abs(newRotationY - targetRotationY) < 0.001 &&
        Math.abs(newRotationX - targetRotationX) < 0.001
      ) {
        newIsInFlyToAnimation = false;
      }
      
      // Reset velocities during animation
      newVelocityY = 0;
      newVelocityX = 0;
    } else if (isDraggingRef.current) {
      // During active dragging, directly apply the target rotation values
      newRotationY = targetRotationY;
      newRotationX = targetRotationX;
      
      // Reset velocities during dragging
      newVelocityY = 0;
      newVelocityX = 0;
    } else {
      // Apply smoothing to rotation or apply inertia when not dragging
      if (Math.abs(targetRotationY - currentRotationY) > 0.001) {
        // Smooth approach to target
        newRotationY =
          currentRotationY + (targetRotationY - currentRotationY) * ANIMATION_CONSTANTS.SMOOTHING_FACTOR;
      } else if (Math.abs(newVelocityY) > ANIMATION_CONSTANTS.MIN_VELOCITY) {
        // Apply inertia
        newRotationY = currentRotationY + newVelocityY;
        newVelocityY *= ANIMATION_CONSTANTS.INERTIA_FACTOR;
      }

      if (Math.abs(targetRotationX - currentRotationX) > 0.001) {
        // Smooth approach to target
        newRotationX =
          currentRotationX + (targetRotationX - currentRotationX) * ANIMATION_CONSTANTS.SMOOTHING_FACTOR;
      } else if (Math.abs(newVelocityX) > ANIMATION_CONSTANTS.MIN_VELOCITY) {
        // Apply inertia
        newRotationX = currentRotationX + newVelocityX;
        newVelocityX *= ANIMATION_CONSTANTS.INERTIA_FACTOR;
      }
    }

    // Constrain vertical rotation to avoid flipping
    newRotationX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, newRotationX));

    // Apply rotation to pivots
    horizontalPivot.rotation.y = newRotationY;
    verticalPivot.rotation.x = newRotationX;

    // Update state
    rotationStateRef.current = {
      ...rotationStateRef.current,
      currentRotationY: newRotationY,
      currentRotationX: newRotationX,
      rotationVelocityY: newVelocityY,
      rotationVelocityX: newVelocityX,
      isInFlyToAnimation: newIsInFlyToAnimation,
      flyToDuration: newFlyToDuration,
    };
  }, [horizontalPivot, verticalPivot]);

  return {
    rotationStateRef,
    isDraggingRef,
    intersectionPointRef,
    previousMousePositionRef,
    lastDragTimeRef,
    previousAngleRef,
    previousVerticalPositionRef,
    dragStartPointRef,
    movementTrackingRef,
    updateTargetRotation,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    updateRotation,
  };
}; 