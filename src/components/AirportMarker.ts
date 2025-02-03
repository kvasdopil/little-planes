import maplibregl, { Map } from 'maplibre-gl';
import { Airport } from '../types/mapTypes';
import { sizeToScale } from '../utils/mapUtils';
import { getTotalDailyFlights } from '../flightData';

export function createMarker(airport: Airport, map: Map) {
  const size = airport.size;
  const iconElement = document.createElement('div');
  iconElement.style.position = 'relative';
  iconElement.style.width = '0';
  iconElement.style.height = '0';

  // Create dot element
  const dot = document.createElement('div');
  dot.style.width = `${sizeToScale[size] * 8}px`;
  dot.style.height = `${sizeToScale[size] * 8}px`;
  dot.style.borderRadius = '50%';
  dot.style.backgroundColor = '#D3D3D3';
  dot.style.position = 'absolute';
  dot.style.left = '50%';
  dot.style.top = '50%';
  dot.style.transform = 'translate(-50%, -50%)';
  iconElement.appendChild(dot);

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

  const airportName = airport.name.replace('Airport', '').trim();
  const dailyFlights = getTotalDailyFlights(airportName);
  
  new maplibregl.Marker({
    element: iconElement,
    draggable: false
  })
    .setLngLat(airport.coordinates)
    .setPopup(new maplibregl.Popup().setHTML(
      `<div style="color: #D3D3D3">
        <strong>${airportName}</strong><br>
        Average daily domestic flights: ${dailyFlights}
      </div>`
    ))
    .addTo(map);
} 