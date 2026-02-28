// src/components/maps/OSMMarker.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';

const OSMMarker = ({ map, destination, index, onClick }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Create custom marker HTML
    const markerHtml = ReactDOMServer.renderToString(
      <div className={`relative group cursor-pointer`}>
        <div className={`w-8 h-8 bg-primary-600 rounded-full border-2 border-white shadow-lg 
                      flex items-center justify-center text-white font-bold text-sm
                      hover:scale-110 transition-transform`}>
          {index + 1}
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                      bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap
                      opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {destination.name || destination.city}
        </div>
      </div>
    );

    // Create custom icon
    const customIcon = L.divIcon({
      html: markerHtml,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // Add marker
    const marker = L.marker([destination.latitude, destination.longitude], {
      icon: customIcon
    }).addTo(map);

    marker.on('click', onClick);
    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    };
  }, [map, destination, index, onClick]);

  return null;
};

export default OSMMarker;