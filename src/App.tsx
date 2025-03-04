import { useRef } from 'react';
import './App.css';
import Cities from './components/Cities';
import useGlobeSetup from './hooks/useGlobeSetup';
import useEarthInteraction from './hooks/useEarthInteraction';

function App() {
  // Reference to the container that will hold the scene
  const mountRef = useRef<HTMLDivElement>(null);

  // Use the globe setup hook to initialize the scene
  const { scene, camera, renderer, earth, horizontalPivot, verticalPivot, earthRadius } =
    useGlobeSetup(mountRef);

  // Use the Earth interaction hook to handle rotation, zooming, etc.
  // No need to destructure anything else - the hook sets up event listeners internally
  const { updateTargetRotation } = useEarthInteraction({
    scene,
    camera,
    renderer,
    earth,
    horizontalPivot,
    verticalPivot,
  });

  return (
    <div className="app-container">
      <div ref={mountRef} className="scene-container" style={{ width: '100%', height: '100vh' }} />
      {scene && camera && horizontalPivot && verticalPivot && (
        <Cities
          scene={scene}
          camera={camera}
          earthRadius={earthRadius}
          horizontalPivot={horizontalPivot}
          verticalPivot={verticalPivot}
          updateTargetRotation={updateTargetRotation}
        />
      )}
    </div>
  );
}

export default App;
