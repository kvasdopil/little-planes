# Swedish Airports Map Implementation Plan

## Project Overview

An interactive map visualization showing Swedish airports and real-time flight animations. The application displays major airports as dots of varying sizes, with curved flight paths showing routes between them. Animated airplanes move along these routes at a constant speed, creating a dynamic visualization of domestic flight patterns.

## Technology Stack

- **React**: Frontend framework
- **TypeScript**: Type-safe JavaScript
- **MapLibre GL JS**: Open-source map rendering library
- **Turf.js**: Geospatial calculations library
- **Stadia Maps**: Vector tile provider
- **FontAwesome**: Icon library for airplane symbols

## Project Structure

```
src/
├── components/
│   ├── AirplaneAnimation.ts    # Airplane movement and animation logic
│   ├── AirportMarker.ts        # Airport marker creation and styling
│   └── FlightRoutes.ts         # Flight route generation and rendering
├── types/
│   └── mapTypes.ts             # TypeScript type definitions
├── utils/
│   └── mapUtils.ts             # Utility functions and constants
├── App.tsx                     # Main application component
├── MapComponent.tsx           # Map initialization and coordination
├── airportsData.ts            # Airport locations and metadata
└── flightData.ts             # Flight routes and frequency data
```

## Core Features

### 1. Map Display

- Dark theme vector map using Stadia Maps
- Centered on Sweden with appropriate zoom level
- Smooth performance with multiple animated elements

### 2. Airport Visualization

- Airports represented as light gray dots
- Size varies based on airport category (small/medium/large)
- Interactive labels showing airport names
- Popups displaying flight statistics
- Proper cleanup of map elements

### 3. Flight Routes

- Curved geodesic lines between connected airports
- Light gray color with 15% opacity
- Line thickness of 2 pixels
- Proper great circle path calculations

### 4. Flight Animations

- FontAwesome airplane icons
- Spawn every second on random routes
- Constant speed of 250 degrees per second
- Proper rotation along flight path
- Smooth interpolation between points
- Independent movement of multiple planes

## Technical Implementation

### 1. Route Calculation

- Uses Turf.js for geospatial calculations
- Implements geodesic line interpolation
- Handles Earth's curvature for realistic paths
- 100 interpolation points per route for smoothness

### 2. Animation System

- Time-based animation using requestAnimationFrame
- Distance-based movement for consistent speed
- Proper bearing calculations for plane rotation
- Efficient cleanup of completed animations

### 3. Resource Management

- Modular code structure
- Component-based architecture
- Proper initialization checks
- Memory leak prevention
- Cleanup on component unmount

### 4. Error Handling

- Map initialization safety checks
- Animation error recovery
- Resource cleanup on errors
- Proper error logging

## Performance Optimizations

- Efficient layer management
- Proper cleanup of unused resources
- Optimized animation calculations
- Smooth handling of multiple simultaneous animations
- Modular code splitting for better maintainability

## Future Enhancements

1. Add flight schedule data
2. Implement weather effects
3. Add flight filtering options
4. Show flight statistics visualization
5. Add time-based flight patterns
6. Implement zoom-dependent detail levels

## Code Style and Best Practices

- Consistent TypeScript types usage
- Modular component architecture
- Clean code principles
- Proper error handling
- Performance optimization
- Clear separation of concerns

## TypeScript Configuration

The project uses a dual TypeScript configuration setup, following Vite's recommended practices:

### Main Configuration (tsconfig.json)

- Target: ES2022 for modern browser features
- Strict type checking enabled
- DOM and DOM.Iterable type definitions
- React JSX support
- Path aliases for clean imports
- Module resolution set to "bundler"
- Source maps and declaration files enabled

### Node Configuration (tsconfig.node.json)

- Separate configuration for Vite and build tools
- Node.js specific settings
- ESM module system
- Synthetic default imports allowed
- References the main tsconfig.json
- Used by vite.config.ts and other build scripts

This separation ensures:

- Browser code doesn't include Node.js types
- Build tools have access to Node.js features
- Clear boundary between frontend and build environments
- Proper type checking in both contexts
