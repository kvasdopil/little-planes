import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

function App() {
  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json',
      center: [18.6435, 60.1282],
      zoom: 5
    });

    const cities: { name: string; coordinates: [number, number] }[] = [
      { name: 'Stockholm', coordinates: [18.0686, 59.3293] },
      { name: 'Gothenburg', coordinates: [11.9746, 57.7089] },
      { name: 'Malmö', coordinates: [13.0038, 55.6050] },
      { name: 'Uppsala', coordinates: [17.6389, 59.8586] },
      { name: 'Västerås', coordinates: [16.5448, 59.6099] },
      { name: 'Örebro', coordinates: [15.2134, 59.2741] },
      { name: 'Linköping', coordinates: [15.6214, 58.4108] },
      { name: 'Helsingborg', coordinates: [12.6945, 56.0465] },
      { name: 'Jönköping', coordinates: [14.1618, 57.7826] },
      { name: 'Norrköping', coordinates: [16.1924, 58.5877] }
    ];

    cities.forEach(city => {
      new maplibregl.Marker({
        color: '#FFD700', // Gold color for star
        draggable: false
      })
        .setLngLat(city.coordinates)
        .setPopup(new maplibregl.Popup().setText(city.name))
        .addTo(map);
    });

    return () => map.remove();
  }, []);

  return <div id="map" style={{ height: '100vh', width: '100%' }} />;
}

export default App;
