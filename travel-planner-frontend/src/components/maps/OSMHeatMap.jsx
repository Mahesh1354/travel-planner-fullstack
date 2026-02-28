// src/components/maps/OSMHeatMap.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.heat';

const OSMHeatMap = ({ destinations, center, zoom }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  // Update heatmap when destinations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
    }

    // Create heat data
    const heatData = destinations.map(d => [
      d.latitude,
      d.longitude,
      d.activityCount || 1 // weight
    ]);

    // Add heat layer
    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(mapInstanceRef.current);

    // Fit bounds
    if (destinations.length > 0) {
      const bounds = L.latLngBounds(destinations.map(d => [d.latitude, d.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [destinations]);

  return (
    <>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <p className="text-sm font-medium mb-2">Activity Density</p>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
            <span className="text-xs">Low</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
            <span className="text-xs">High</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default OSMHeatMap;