// src/components/maps/OSMPopup.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import ReactDOM from 'react-dom';

const OSMPopup = ({ map, destination, onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!map || !destination) return;

    const popupContent = document.createElement('div');
    popupContent.className = 'p-3 max-w-xs';
    popupContent.innerHTML = `
      <h3 class="font-semibold text-gray-900 mb-2">${destination.name || destination.city}</h3>
      <p class="text-sm text-gray-500 mb-2">${destination.city}, ${destination.country}</p>
      ${destination.arrivalDate ? `
        <p class="text-xs text-gray-500 mb-2">
          ${new Date(destination.arrivalDate).toLocaleDateString()} - ${new Date(destination.departureDate).toLocaleDateString()}
        </p>
      ` : ''}
      ${destination.accommodationName ? `
        <div class="mb-2 p-2 bg-gray-50 rounded">
          <p class="text-xs font-medium text-gray-700">🏨 ${destination.accommodationName}</p>
        </div>
      ` : ''}
      <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>📅 ${destination.nights || 0} nights</span>
        <span>🎯 ${destination.activityCount || 0} activities</span>
      </div>
      <div class="flex gap-2">
        <a href="/destination/${destination.id}" class="flex-1 text-center text-xs bg-primary-600 text-white px-3 py-1.5 rounded hover:bg-primary-700">
          View Details
        </a>
        <a href="https://www.openstreetmap.org/directions?from=&to=${destination.latitude}%2C${destination.longitude}" target="_blank" class="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
          Directions
        </a>
      </div>
    `;

    popupRef.current = L.popup({ maxWidth: 300 })
      .setLatLng([destination.latitude, destination.longitude])
      .setContent(popupContent)
      .openOn(map);

    return () => {
      if (popupRef.current) {
        map.closePopup(popupRef.current);
      }
    };
  }, [map, destination]);

  return null;
};

export default OSMPopup;