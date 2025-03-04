# Project Setup Guide

## Prerequisites

- Node.js (v18 or later recommended)
- npm (v8 or later recommended)
- Git

## Installation

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd [project-directory]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Project

### Development Mode

To start the development server with hot-reloading:

```bash
npm run dev
```

This will start the Vite development server, usually at http://localhost:5173

### Build for Production

To build the project for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
.
├── src/                    # Source code
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   ├── App.css             # Main application styles
│   ├── main.tsx            # Entry point
│   └── vite-env.d.ts       # Vite environment types
├── public/                 # Static assets
│   ├── textures/           # Earth texture files
├── docs/                   # Documentation
│   ├── architecture.md     # Architecture documentation
│   ├── bugs.md             # Bug tracking
│   └── memory.md           # Project structure memory
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.js          # Vite configuration
└── README.md               # Project overview
```

## Development Workflow

1. Make changes to the code
2. Test changes using `npm run dev`
3. Fix any lint errors with `npm run lint`
4. Build and preview with `npm run build` and `npm run preview`
5. Commit changes

## Troubleshooting

### Common Issues

1. **Black screen or no globe visible**

   - Check the browser console for errors
   - Ensure the Earth texture files are accessible
   - Verify Three.js is properly initialized in the useGlobeSetup hook

2. **Globe not responding to interactions**

   - Check that event listeners are properly setup in useEarthInteraction
   - Verify that the mouse events are being captured by the correct DOM element

3. **Cities not visible**
   - Check that the Cities component is receiving the proper scene and camera props
   - Verify the city data in constants.ts has the correct latitude/longitude values

### Debug Tools

- To see the Three.js performance stats, uncomment the Stats component in App.tsx
- Use React DevTools to inspect component props and state
- Chrome's Performance tab can help identify performance bottlenecks

## Contributing

1. Follow the existing code style
2. Document new features or changes in the appropriate docs files
3. Update the bugs.md file when fixing issues
4. Write clear commit messages describing the changes made
