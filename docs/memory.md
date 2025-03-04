# Project Memory

## Project Structure

The project is a 3D globe visualization with city markers. The codebase has been refactored to follow a better organized structure:

### Component Structure

- `App.tsx` - Main application component
- `components/Cities.tsx` - Component for displaying city markers on the globe

### Hooks

- `hooks/useGlobeSetup.ts` - Sets up the 3D scene, camera, renderer and creates the Earth globe
- `hooks/useEarthInteraction.ts` - Handles Earth rotation, zooming, and other interactions
- `hooks/useCities.ts` - Manages city markers, labels, and interactions with cities

### Utilities

- `utils/coordinates.ts` - Functions for coordinate conversions (lat/lng to 3D, mouse coordinates)
- `utils/constants.ts` - Constants for city data, Earth parameters, and animation settings
- `utils/animation.ts` - Animation-related utility functions (bounce, easing, FOV calculation)
- `utils/cityHelpers.ts` - Helper functions for city markers and labels

## Key Functionality

### Earth Globe Rotation

- Uses raycasting to find the intersection point on the globe
- Calculates rotation angles based on mouse movement
- Applies smoothing and inertia for natural movement

### City Markers

- Displays cities on the globe with 3D markers and text labels
- Scales markers based on distance to ensure consistent size
- Supports hover animations and selection

### Camera Controls

- Supports zooming with the mouse wheel
- Animated camera movement to selected cities
- Dynamically adjusts field of view based on zoom level

## Recent Changes

1. Refactored the codebase to:

   - Split large files into smaller, focused modules
   - Created custom hooks for better separation of concerns
   - Extracted utility functions into separate files

2. Fixed issues with:
   - Globe rotation event handling
   - Non-passive event listener warnings
   - Type conflicts in event handlers
   - Animation and rendering loops

## Code Review and Refactoring Suggestions

### Architecture Improvements

1. **Break Down Large Hooks**:

   - Split `useEarthInteraction.ts` (513 lines) into:
     - `useEarthRotation.ts` - Handle rotation logic
     - `useEarthZooming.ts` - Handle zoom functionality
     - `useAnimationLoop.ts` - Handle animation frame management
   - Split `useCities.ts` (309 lines) into:
     - `useCityMarkers.ts` - City marker creation and management
     - `useCityLabels.ts` - Label positioning and rendering
     - `useCityInteraction.ts` - Handle click/hover interactions

2. **Use More Reactive Programming**:

   - Replace imperative DOM event handling with React's event system where possible
   - Consider using a state management library for complex state

3. **Performance Optimization Areas**:

   - Minimize Three.js object creation in render loops
   - Use object pooling for city markers
   - Implement level-of-detail rendering for distant cities

4. **Code Duplication**:
   - Consolidate coordinate transformation logic
   - Create shared utilities for event handling
   - Extract animation logic into reusable functions

### Component Structure Refactoring

The application would benefit from a more component-oriented architecture:

1. **Component Hierarchy**:

   ```
   App
   ├── EarthGlobe
   │   ├── EarthSphere
   │   ├── Stars
   │   └── CityMarkers
   │       ├── CityMarker (individual city marker)
   │       └── CityLabel (individual city label)
   ├── Controls
   │   ├── ZoomControls
   │   └── RotationControls
   └── UI
       ├── CityPanel (shows info for selected city)
       └── SearchBar (for finding cities)
   ```

2. **State Management**:

   - Use React Context for global state (selected city, animation state)
   - Use a reducer pattern for complex state transitions
   - Consider replacing mutable refs with immutable state where appropriate

3. **Event Handling**:

   - Move DOM event listeners into React event handlers where possible
   - Use event delegation for city marker interactions
   - Implement proper cleanup of event listeners in useEffect return functions

4. **Performance Improvements**:
   - Use React.memo for pure components
   - Use useCallback for event handlers and functions passed to child components
   - Use useMemo for expensive calculations
   - Consider using a virtualized rendering approach for many city markers

### Specific Refactoring Example: useEarthInteraction

Current issues with `useEarthInteraction.ts`:

- Too many responsibilities (rotation, zooming, animation, event handling)
- Complex state management with many refs
- Mixing of React state and imperative Three.js code
- Potential memory leaks due to improper cleanup

**Proposed Refactoring:**

1. **Split into Smaller Hooks:**

```typescript
// useEarthRotation.ts
export const useEarthRotation = (horizontalPivot, verticalPivot) => {
  const [rotation, setRotation] = useState({ horizontal: 0, vertical: 0 });
  const velocityRef = useRef({ horizontal: 0, vertical: 0 });

  // Rotation logic only...

  return {
    rotation,
    setTargetRotation,
    stopRotation,
  };
};

// useEarthZoom.ts
export const useEarthZoom = (camera) => {
  const [zoom, setZoom] = useState(DEFAULT_CAMERA_POSITION.ZOOM);

  // Zoom logic only...

  return {
    zoom,
    setTargetZoom,
    handleWheel,
  };
};

// useAnimationLoop.ts
export const useAnimationLoop = (callback) => {
  const requestRef = useRef<number>();

  useEffect(() => {
    const animate = (time: number) => {
      callback(time);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callback]);
};
```

2. **Replace Ref-based State with Reducer:**

```typescript
// earthInteractionReducer.ts
type State = {
  targetRotation: { x: number; y: number };
  currentRotation: { x: number; y: number };
  velocity: { x: number; y: number };
  zoom: number;
  targetZoom: number;
  isAnimating: boolean;
};

type Action =
  | { type: 'SET_TARGET_ROTATION'; payload: { x: number; y: number } }
  | { type: 'UPDATE_ROTATION'; payload: { x: number; y: number } }
  | { type: 'SET_VELOCITY'; payload: { x: number; y: number } }
  | { type: 'SET_ZOOM'; payload: number };
// etc.

function earthInteractionReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TARGET_ROTATION':
      return { ...state, targetRotation: action.payload };
    // other cases...
    default:
      return state;
  }
}
```

3. **Proper Event Cleanup:**

```typescript
useEffect(() => {
  const handleMouseDown = (e) => {
    /* ... */
  };
  const handleMouseMove = (e) => {
    /* ... */
  };
  const handleMouseUp = () => {
    /* ... */
  };

  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return () => {
    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [dependencies]);
```

4. **Use Memoization for Performance:**

```typescript
const animate = useCallback(
  (time) => {
    // Animation logic
  },
  [dependencies]
);

useAnimationLoop(animate);
```

### ThreeJS Performance Optimizations

The current implementation could be optimized for better performance with large numbers of cities:

1. **Geometry and Material Sharing:**

```typescript
// CURRENT APPROACH (inefficient):
CITIES.forEach((city) => {
  const cityGeometry = new THREE.SphereGeometry(0.3, 16, 16);
  const cityMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const cityMesh = new THREE.Mesh(cityGeometry, cityMaterial);
  // ...
});

// OPTIMIZED APPROACH:
const sharedGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const sharedMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

CITIES.forEach((city) => {
  const cityMesh = new THREE.Mesh(sharedGeometry, sharedMaterial.clone());
  // Only clone material if you need to modify it per instance
  // ...
});
```

2. **Instancing for City Markers:**

For large numbers of cities, use InstancedMesh:

```typescript
const cityCount = CITIES.length;
const instancedMesh = new THREE.InstancedMesh(
  new THREE.SphereGeometry(0.3, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffffff }),
  cityCount
);

const matrix = new THREE.Matrix4();
CITIES.forEach((city, index) => {
  const position = latLngToVector3(city.lat, city.lng, earthRadius);
  matrix.setPosition(position);
  instancedMesh.setMatrixAt(index, matrix);
});

instancedMesh.instanceMatrix.needsUpdate = true;
scene.add(instancedMesh);
```

3. **Object Lifecycle Management:**

The current code potentially creates and disposes of objects inefficiently:

```typescript
// CURRENT APPROACH (potential memory issues):
useEffect(() => {
  // Create objects
  return () => {
    // Disposal missing or incomplete
  };
}, []);

// OPTIMIZED APPROACH:
useEffect(() => {
  const geometry = new THREE.SphereGeometry(0.3, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  return () => {
    scene.remove(mesh);
    geometry.dispose();
    material.dispose();
    // Properly dispose of all resources
  };
}, [scene]);
```

4. **Animation Performance:**

```typescript
// Use framerate-independent animations:
const animate = (time: number) => {
  const deltaTime = time - lastTimeRef.current;
  lastTimeRef.current = time;

  // Use deltaTime to scale animations
  const rotationAmount = angularVelocity * deltaTime * 0.001; // Convert to seconds

  // Apply rotation
};
```

5. **Level of Detail (LOD) Rendering:**

```typescript
const setupCityLOD = (city, position) => {
  const lod = new THREE.LOD();

  // High detail (close-up)
  const highDetailGeometry = new THREE.SphereGeometry(0.3, 16, 16);
  const highDetailMesh = new THREE.Mesh(
    highDetailGeometry,
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  lod.addLevel(highDetailMesh, 0);

  // Medium detail
  const mediumDetailGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  const mediumDetailMesh = new THREE.Mesh(
    mediumDetailGeometry,
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  lod.addLevel(mediumDetailMesh, 5);

  // Low detail (far away)
  const lowDetailGeometry = new THREE.SphereGeometry(0.3, 4, 4);
  const lowDetailMesh = new THREE.Mesh(
    lowDetailGeometry,
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  lod.addLevel(lowDetailMesh, 10);

  lod.position.copy(position);
  return lod;
};
```

### Code Organization and Maintainability

The codebase would benefit from improved organization and stricter type safety:

1. **Enhanced Type Definitions:**

```typescript
// Create a global types file for shared interfaces
// src/types/globe.ts
export interface CityData {
  name: string;
  lat: number;
  lng: number;
  population?: number;
  country?: string;
  description?: string;
}

export interface EarthConfig {
  radius: number;
  textureUrl: string;
  bumpMapUrl?: string;
  specularMapUrl?: string;
  cloudMapUrl?: string;
  rotationSpeed: number;
}

export interface CameraConfig {
  minDistance: number;
  maxDistance: number;
  initialDistance: number;
  minFov: number;
  maxFov: number;
  dampingFactor: number;
}

// Use these types throughout the application
```

2. **Dependency Structure:**

```
src/
├── components/              # React components
│   ├── earth/              # Earth-related components
│   └── ui/                 # User interface components
├── hooks/                  # React hooks
│   ├── earth/              # Earth-related hooks
│   ├── animation/          # Animation-related hooks
│   └── interaction/        # User interaction hooks
├── services/               # Application services
│   ├── cityService.ts      # Service for city data
│   └── earthService.ts     # Service for earth configuration
├── utils/                  # Utility functions
│   ├── math/               # Math utilities
│   ├── three/              # Three.js utilities
│   └── animation/          # Animation utilities
├── types/                  # TypeScript type definitions
└── constants/              # Application constants
```

3. **Configuration Management:**

```typescript
// src/config/earthConfig.ts
import { EarthConfig } from '../types/globe';

export const earthConfig: EarthConfig = {
  radius: 2,
  textureUrl: '/textures/earth.jpg',
  bumpMapUrl: '/textures/earth_bump.jpg',
  specularMapUrl: '/textures/earth_specular.jpg',
  rotationSpeed: 0.005,
};

// src/config/cameraConfig.ts
import { CameraConfig } from '../types/globe';

export const cameraConfig: CameraConfig = {
  minDistance: 2.2,
  maxDistance: 10,
  initialDistance: 6,
  minFov: 40,
  maxFov: 60,
  dampingFactor: 0.05,
};

// This allows for easier configuration changes and testing
```

4. **Error Handling and Debugging:**

```typescript
// Add a logging utility
// src/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private enabled: boolean = process.env.NODE_ENV !== 'production';
  private level: LogLevel = 'info';

  setLevel(level: LogLevel) {
    this.level = level;
  }

  debug(message: string, ...args: any[]) {
    if (this.enabled && this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.enabled && this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.enabled && this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.enabled && this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}

export const logger = new Logger();

// Then use throughout the application:
// logger.debug('Setting up Earth', { radius: earthConfig.radius });
```

5. **Testing Strategy:**

```typescript
// Component tests with Testing Library
// src/components/Cities.test.tsx
import { render, screen } from '@testing-library/react';
import Cities from './Cities';

// Mock three.js
jest.mock('three', () => ({
  Scene: jest.fn(() => ({ add: jest.fn() })),
  Camera: jest.fn(),
  Object3D: jest.fn(),
}));

describe('Cities component', () => {
  it('should render without crashing', () => {
    const mockScene = new THREE.Scene();
    const mockCamera = new THREE.Camera();

    render(
      <Cities
        scene={mockScene}
        camera={mockCamera}
        earthRadius={2}
        horizontalPivot={new THREE.Object3D()}
        verticalPivot={new THREE.Object3D()}
      />
    );

    // Component doesn't render visible elements, so we just verify it doesn't crash
    expect(true).toBeTruthy();
  });
});

// Hook tests
// src/hooks/useEarthRotation.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useEarthRotation } from './useEarthRotation';

describe('useEarthRotation', () => {
  it('should update rotation when setTargetRotation is called', () => {
    const mockHorizontalPivot = { rotation: { y: 0 } };
    const mockVerticalPivot = { rotation: { x: 0 } };

    const { result } = renderHook(() =>
      useEarthRotation(mockHorizontalPivot, mockVerticalPivot)
    );

    act(() => {
      result.current.setTargetRotation(1, 0.5);
    });

    // Assert that rotation was updated
    expect(result.current.rotation.horizontal).toBeCloseTo(1);
    expect(result.current.rotation.vertical).toBeCloseTo(0.5);
  });
});
```

## Refactoring Recommendations Summary

### Major Issues

1. **Code Organization Issues:**

   - Bloated hooks with multiple responsibilities (useEarthInteraction: 513 lines)
   - Unclear separation between component and hook responsibilities
   - Heavy use of mutable refs for state management leading to side effects

2. **Performance Concerns:**

   - Inefficient object creation (new geometry/material for each city)
   - Potential memory leaks due to incomplete clean-up in useEffect
   - No optimization for rendering many cities (no instancing or LOD)

3. **Architecture Limitations:**
   - Poor scalability for adding new features due to tightly coupled code
   - Limited reusability of Earth and city marker implementations
   - Direct DOM manipulation mixed with React patterns

### Recommended Approach

The refactoring should be implemented in phases:

#### Phase 1: Code Splitting & Immediate Fixes

- Split useEarthInteraction into focused hooks (rotation, zoom, animation)
- Fix potential memory leaks with proper cleanup in useEffect
- Share geometries and materials for city markers

#### Phase 2: State Management & Component Refactoring

- Implement a proper state management strategy (reducers, context)
- Create component hierarchy with clear responsibilities
- Add error boundaries and improved debugging

#### Phase 3: Performance Optimizations

- Implement instancing for city markers
- Add LOD for performance with many cities
- Optimize animation loops

#### Phase 4: Testing & Documentation

- Create unit tests for core functionality
- Document architecture decisions and component responsibilities
- Create storybook or examples for key components

### Expected Benefits

- **Maintainability:** Smaller, focused files with clear responsibilities
- **Performance:** Better rendering performance, especially with many cities
- **Extensibility:** Easier to add new features like city search or information panels
- **Reliability:** Fewer bugs from unexpected side effects or memory leaks
- **Developer Experience:** Better type safety, clear interfaces between components
