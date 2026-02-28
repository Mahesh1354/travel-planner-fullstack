// src/components/maps/OSMRouteMap.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';

const OSMRouteMap = ({ destinations, center, zoom }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);

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

  // Update route when destinations change
  useEffect(() => {
    if (!mapInstanceRef.current || destinations.length < 2) return;

    // Remove existing routing control
    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
    }

    // Create waypoints
    const waypoints = destinations.map(d => 
      L.latLng(d.latitude, d.longitude)
    );

    // Add routing control
    routingControlRef.current = L.Routing.control({
      waypoints,
      routeWhileDragging: true,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#0284c7', weight: 4 }]
      }
    }).addTo(mapInstanceRef.current);

    // Fit bounds
    const bounds = L.latLngBounds(destinations.map(d => [d.latitude, d.longitude]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });

  }, [destinations]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default OSMRouteMap;