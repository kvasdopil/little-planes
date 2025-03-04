# Known Bugs and Issues

## Current Issues

- **Zoom Speed Too Fast**
  - Issue: The speed of zooming when using the mouse wheel is too fast
  - Cause: The zoom speed constant was set too high and the calculation didn't properly normalize across devices
  - Attempted Fix:
    - Reduced ZOOM_SPEED constant from 1.2 to 0.5
    - Updated the zoom calculation to use a square root scaling for a gentler zoom curve
    - Added normalization for wheel delta to improve consistency across devices

## Fixed Issues

1. **Globe Rotation Not Working**

   - Issue: Globe was not rotating when dragging with the mouse
   - Cause: Event handling issues with mouse interactions
   - Solution:
     - Updated event listeners to use proper element references
     - Fixed event type handling for both DOM and React events
     - Improved animation loop pattern

2. **Non-passive Event Listener Warning**

   - Issue: Console warnings about non-passive event listeners for wheel events
   - Cause: Event listener for wheel events was not marked as passive
   - Solution: Added `{ passive: true }` option to the wheel event listener, removed preventDefault() call

3. **Maximum Update Depth Exceeded Error**
   - Issue: React error "Maximum update depth exceeded" in useEarthInteraction hook
   - Cause: Circular dependency where animate function updated state via setRotationState, which caused a re-render and re-initiated the animation loop
   - Solution:
     - Replaced React useState with useRef for animation state
     - Removed rotationState from useEffect dependency array
     - Updated event handlers to work with ref-based state
     - Fixed vertical rotation and velocity calculations

## Active Bugs

- Issue: Globe rotation stopped working after refactoring the useEarthInteraction hook

  - Description: After refactoring useEarthInteraction and splitting it into separate hooks, globe rotation no longer works properly. User can zoom and click cities, but cannot rotate the globe by dragging.
  - Root cause: The dependency array in the event listener setup in useEarthInteraction only depends on scene, but not on earth and camera. This causes the event listeners to not be properly attached when all required dependencies are available.
  - Suggested fix: Update the useEarthInteraction hook to check for all required dependencies (scene, earth, camera) before setting up event listeners.
  - Status: Fixed

- Issue: Cannot read properties of undefined (reading 'getBoundingClientRect')

  - Description: After fixing the event listener attachment, a JavaScript error occurs when trying to handle mouse events.
  - Root cause: The getNormalizedMousePosition function in coordinates.ts requires a DOM element to calculate the normalized coordinates, but we weren't passing this element from useEarthRotation hook.
  - Suggested fix:
    - Update the getNormalizedMousePosition function to handle cases when no DOM element is provided
    - Pass the renderer's domElement from useEarthInteraction to useEarthRotation
    - Handle possible null values appropriately
  - Status: Fixed

- Issue: Vertical rotation not working
  - Description: While horizontal rotation (left/right) works, vertical rotation (up/down) doesn't respond to dragging.
  - Root cause: The updateRotation function in useEarthRotation had a conditional that skipped applying immediate rotation during active dragging, only handling the case when not dragging.
  - Suggested fix: Add a specific condition to handle the active dragging state, directly applying the target rotation values during drag operations.
  - Status: Fixed
