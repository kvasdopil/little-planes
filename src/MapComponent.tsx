import { useEffect, createElement } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane } from '@fortawesome/free-solid-svg-icons';
import ReactDOM from 'react-dom';
import { airports } from './airportsData';

const sizeToScale = {
  small: 0.8,
  medium: 0.9,
  large: 1
};

function createMarker(airport: { name: string; coordinates: [number, number]; size: 'small' | 'medium' | 'large' }, map: Map) {
  const size = airport.size;
  const iconElement = document.createElement('div');
  iconElement.style.position = 'relative';
  iconElement.style.width = '0';
  iconElement.style.height = '0';

  const icon = createElement(FontAwesomeIcon, {
    icon: faPlane,
    style: { fontSize: `${sizeToScale[size] * 24}px`, color: '#D3D3D3', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  });
  ReactDOM.render(icon, iconElement);

  setTimeout(() => {
    const textElement = document.createElement('span');
    textElement.textContent = ` ${airport.name.replace('Airport', '').trim()}`;
    textElement.style.position = 'absolute';
    textElement.style.top = 'calc(100% + 4px)';
    textElement.style.left = '50%';
    textElement.style.transform = 'translateX(-50%)';
    textElement.style.fontSize = `${sizeToScale[size] * 12}px`;
    textElement.style.color = '#D3D3D3';

    iconElement.appendChild(textElement);
  }, 0);

  new maplibregl.Marker({
    element: iconElement,
    draggable: false
  })
    .setLngLat(airport.coordinates)
    .setPopup(new maplibregl.Popup().setText(airport.name.replace('Airport', '').trim()))
    .addTo(map);
}

function MapComponent() {
  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json',
      center: [18.6435, 60.1282],
      zoom: 5
    });

    airports.forEach(airport => createMarker(airport, map));

    return () => map.remove();
  }, []);

  return <div id="map" style={{ height: '100vh', width: '100%' }} />;
}

export default MapComponent; 