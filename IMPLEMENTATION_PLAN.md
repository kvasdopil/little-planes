# Implementation Plan for City Network Game

## Project Structure

```
planes-game/
├── src/
│   ├── components/
│   │   ├── Game/
│   │   │   ├── City.tsx
│   │   │   ├── Route.tsx
│   │   │   └── GameScene.tsx
│   │   ├── UI/
│   │   └── Scene/
│   ├── models/
│   │   ├── City.ts
│   │   └── Route.ts
│   ├── hooks/
│   ├── utils/
│   └── assets/
├── terraform/
│   ├── main.tf
│   └── variables.tf
└── public/
```

## Tech Stack

- React with TypeScript for UI and game logic
- Three.js for 3D rendering
- Vite for build tooling and development
- ESLint + Prettier for code quality
- Terraform for GCP deployment

## Implementation Phases

### Phase 1: Project Setup and Basic Structure ✅

- [x] Initialize project with Vite
- [x] Set up TypeScript configuration
- [x] Configure ESLint and Prettier
- [x] Set up Three.js with React Three Fiber
- [x] Create basic project structure
- [x] Set up deployment configuration

### Phase 2: Basic Game Elements and Edit Mode ✅

- [x] Create basic city components
- [x] Implement city selection system
- [x] Add hover effects and cursor interaction
- [x] Implement Edit mode with route preview
- [x] Add background click to exit Edit mode

### Phase 3: Route Management and Movement ✅

- [x] Implement basic route creation between cities
- [x] Add route validation:
  - [x] Prevent duplicate routes
  - [x] Handle non-directional routes
- [x] Implement route preview system
- [x] Add route state management
- [x] Implement plane movement system
  - [x] Basic movement along routes
  - [x] Return journey handling
  - [x] Smooth transitions and rotations
  - [x] Consistent speed across routes

### Phase 4: Map and Navigation ✅

- [x] Set up Nordic cities layout
  - [x] Add real city coordinates
  - [x] Scale coordinates to game space
  - [x] Optimize city placement
- [x] Implement map navigation
  - [x] Add panning controls
  - [x] Add zoom controls
  - [x] Set appropriate zoom limits
  - [x] Auto-fit cities to viewport
- [x] Polish city visuals
  - [x] Add city names
  - [x] Add hover animations
  - [x] Optimize city spacing
  - [x] Different sizes for major/minor cities

### Phase 5: Airplane System ✅

- [x] Add airplane models:
  - [x] Bingo Buzzer
  - [x] Fatso Fantastic
- [x] Implement airplane management:
  - [x] City-specific airplane availability
  - [x] Airplane assignment to routes
  - [x] Visual distinction between models
  - [x] Automatic model selection in UI
- [x] Add airplane UI:
  - [x] Model selection in route creation
  - [x] Available airplane counts
  - [x] City-specific airplane inventory

### Phase 6: UI and Interaction Polish ✅

- [x] Enhance route creation:
  - [x] Add confirmation dialog
  - [x] Show route preview while dragging
  - [x] Validate route creation conditions
- [x] Improve city interaction:
  - [x] Add city info panel
  - [x] Show available airplanes
  - [x] Add drag and drop for route creation
- [x] Polish dialog system:
  - [x] Consistent white background style
  - [x] Close buttons
  - [x] Proper event handling
  - [x] Clear airplane model selection

### Phase 7: Advanced Route Features 🚧

- [ ] Implement route deletion
- [ ] Add route properties:
  - [ ] Transport capacity
  - [ ] Maintenance cost
  - [ ] Travel time
- [ ] Add route visualization:
  - [ ] Traffic flow
  - [ ] Capacity indicators

### Phase 8: City Features

- [ ] Add different city types:
  - [ ] Resource producers
  - [ ] Consumers
  - [ ] Trading hubs
- [ ] Implement city properties:
  - [ ] Population
  - [ ] Resource storage
  - [ ] Production rates
- [ ] Create resource flow system
- [ ] Add city growth mechanics
- [ ] Implement trade system

### Phase 9: Graphics and Effects

- [ ] Enhance city visuals:
  - [ ] Size based on population
  - [ ] Type indicators
  - [ ] Status effects
- [ ] Improve route visuals:
  - [ ] Animated traffic flow
  - [ ] Resource movement
  - [ ] Capacity indicators
- [ ] Add particle effects for:
  - [ ] Resource transfer
  - [ ] City growth
  - [ ] Route establishment
- [ ] Implement smooth animations
- [ ] Add visual feedback for events

### Phase 10: Deployment and Testing

- [ ] Set up CI/CD pipeline
- [ ] Implement automated testing
- [ ] Optimize build size
- [ ] Deploy to GCP
- [ ] Performance testing and optimization

## Game Modes

### Edit Mode ✅

- Activated when a city is selected
- Shows a route preview from selected city to cursor
- Can be exited by:
  - Clicking on the background
  - Selecting the same city again
  - Creating a new route
- Used for:
  - Creating routes between cities
  - Modifying city properties
  - Managing resource allocation

### Play Mode (Planned)

- Active gameplay state
- Resource and trade simulation
- City growth and development
- Economic management
- Network optimization

## Development Guidelines

1. Follow TypeScript best practices
2. Write clean, documented code
3. Create reusable components
4. Optimize for performance
5. Regular testing and bug fixing

## Deployment Strategy

1. Build optimization
2. GCP Cloud Storage for static hosting
3. Cloud Run for any backend services
4. Automated deployments via CI/CD
