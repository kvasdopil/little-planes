# Little Planes

A network management game where you connect Nordic cities with air routes and manage a growing fleet of airplanes.

[Play the game](https://planes.guskov.dev)

## Overview

This is a test project to explore capabilities of AI agent assisted coding.

## Features

- Interactive 3D map of Nordic cities
- Drag-and-drop route creation
- Multiple airplane types with different characteristics
- Real-time flight animations
- Economic system with earnings from completed flights
- Smooth camera controls for map navigation

## Tech Stack

- React with TypeScript for UI and game logic
- Three.js with React Three Fiber for 3D rendering
- Vite for build tooling and development
- Terraform for infrastructure management
- Google Cloud Platform for hosting

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GCP
npm run deploy
```

## Infrastructure

The game is hosted on Google Cloud Platform using:

- Cloud Storage for static hosting
- Cloud CDN for content delivery
- Load Balancer with SSL termination
- Custom domain with automatic SSL certificate management
