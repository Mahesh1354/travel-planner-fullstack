// src/components/maps/OSMmap.jsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import OSMMarker from './OSMMarker';
import OSMPopup from './OSMPopup';
import OSMSearch from './OSMSearch';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const OSMmap = ({ 
  destinations = [], 
  center = [20, 0], 
  zoom = 2,
  onMarkerClick,
  height = '100%'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [map, setMap] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const mapInstance = L.map(mapRef.current).setView(center, zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapInstance);

    mapInstanceRef.current = mapInstance;
    setMap(mapInstance);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update view when center/zoom changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Add markers when destinations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    destinations.forEach((dest, index) => {
      const marker = L.marker([dest.latitude, dest.longitude])
        .bindPopup(() => {
          const popupDiv = document.createElement('div');
          popupDiv.className = 'custom-popup';
          return popupDiv;
        })
        .on('popupopen', () => {
          // This will be handled by React
        });

      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(dest);
        }
      });

      marker.addTo(mapInstanceRef.current);
      markersRef.current.push(marker);
    });

    // Fit bounds if multiple destinations
    if (destinations.length > 1) {
      const bounds = L.latLngBounds(destinations.map(d => [d.latitude, d.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [destinations, onMarkerClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} style={{ width: '100%', height }} />
      
      {/* Search Component */}
      <OSMSearch
        map={map}
        onLocationSelect={(location) => {
          mapInstanceRef.current?.setView([location.lat, location.lon], 12);
        }}
        className="absolute top-4 left-4 w-80 z-[1000]"
      />

      {/* Popup Container */}
      {map && (
        <OSMPopup
          map={map}
          destination={destinations.find(d => d.selected)}
          onClose={() => {}}
        />
      )}
    </div>
  );
};

export default OSMmap;