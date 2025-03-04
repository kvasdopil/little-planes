/**
 * Calculates bounce animation value
 * @param progress - Animation progress (0 to 1)
 * @returns Value for the bounce effect
 */
export const calculateBounceValue = (progress: number): number => {
  // Create a bounce effect using a combination of sine and exponential decay
  // This gives an initial expansion followed by a few bounces that settle down
  const bounce = Math.sin(progress * Math.PI * 3) * Math.exp(-progress * 3);

  // Scale factor: starts at 1, peaks at around 1.5, then settles back to 1
  return 1 + bounce * 0.5;
};

/**
 * Apply ease-out cubic function to a value
 * @param t - Value between 0 and 1
 * @returns Eased value
 */
export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Calculates dynamic field of view based on camera distance
 * @param cameraDistance - Current camera distance
 * @param minDistance - Minimum allowed camera distance
 * @param maxDistance - Maximum allowed camera distance
 * @param minFOV - Minimum FOV value
 * @param maxFOV - Maximum FOV value
 * @returns Calculated FOV
 */
export const calculateDynamicFOV = (
  cameraDistance: number,
  minDistance: number,
  maxDistance: number,
  minFOV: number,
  maxFOV: number
): number => {
  const zoomRatio = (cameraDistance - minDistance) / (maxDistance - minDistance);
  return minFOV + zoomRatio * (maxFOV - minFOV);
};
