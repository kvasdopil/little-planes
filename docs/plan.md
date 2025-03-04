## TODO list

### [done] TODO-1: setup basic project structure:

- vite for build system, typescript, eslint, prettier
- include format and lint commands in package.json
- setup git, add relevant gitignore
- three.js
- as a result i want to see a slowly rotating gray wireframe sphere on a black background with stars

### [done] TODO-2: navigating the globe

- use globe texture from https://github.com/HugoPasquier/EarthOpenGL/blob/main/data/textures/earth.jpg instead of wireframe
- remove globe rotation
- when clicking and dragging the globe it should rotate aroung its polar axis
- it is important that the cursor stays at the same place on the globe after rotation

### [done] TODO-3: rotate camera vertically around earth axis, add zoom, make rotation speed consistent across all zoom levels

### TODO-4: add 10 biggest cities in europe to the globe

- should appear as white spheres
- sphere size should remain the same across all zoom levels
- when clicked, the camera should fly to the city, and zoom in
- the transition should be smooth and take 1s
- last clicked city should be highlighted
- city name should be displayed above it, perpendicular to the camera view
- font size should remain same across all zoom levels
