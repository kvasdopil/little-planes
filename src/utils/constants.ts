/**
 * City data with coordinates and names
 */
export const CITIES = [
  { name: 'London', lat: 51.509865, lng: -0.118092 },
  { name: 'Paris', lat: 48.856613, lng: 2.352222 },
  { name: 'Berlin', lat: 52.520008, lng: 13.404954 },
  { name: 'Madrid', lat: 40.416775, lng: -3.70379 },
  { name: 'Rome', lat: 41.902782, lng: 12.496366 },
  { name: 'Barcelona', lat: 41.385063, lng: 2.173404 },
  { name: 'Warsaw', lat: 52.229676, lng: 21.012229 },
  { name: 'Vienna', lat: 48.208176, lng: 16.373819 },
  { name: 'Budapest', lat: 47.497913, lng: 19.040236 },
  { name: 'Prague', lat: 50.073658, lng: 14.41854 },
];

/**
 * Default camera position constants
 */
export const DEFAULT_CAMERA_POSITION = {
  HORIZONTAL_ROTATION: (10 + 90) * (Math.PI / 180), // Point at prime meridian
  VERTICAL_ROTATION: -45 * (Math.PI / 180), // Slight tilt
  ZOOM: 3.0,
};

/**
 * Earth and camera constants
 */
export const EARTH_CONSTANTS = {
  EARTH_RADIUS: 2,
  MIN_CAMERA_DISTANCE: 2.2,
  MAX_CAMERA_DISTANCE: 10,
  INITIAL_CAMERA_DISTANCE: 6,
  MIN_FOV: 40,
  MAX_FOV: 60,
};

/**
 * Animation constants
 */
export const ANIMATION_CONSTANTS = {
  SMOOTHING_FACTOR: 0.05,
  FLY_TO_SMOOTHING_FACTOR: 0.04,
  INERTIA_FACTOR: 0.96,
  MIN_VELOCITY: 0.0001,
  ROTATION_SPEED: 0.002,
  ZOOM_SPEED: 1.0,
  ZOOM_SMOOTHING_FACTOR: 0.08,
  TOTAL_FLY_TO_DURATION: 60,
};
