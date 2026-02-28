// src/pages/TripMapPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import OSMmap from '../components/maps/OSMmap';
import OSMRouteMap from '../components/maps/OSMRouteMap';
import OSMHeatMap from '../components/maps/OSMHeatMap';
import OSMMapControls from '../components/maps/OSMMapControls';
import OSMDirections from '../components/maps/OSMDirections';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  MapIcon, 
  GlobeAltIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import tripsAPI from '../api/trips';

const TripMapPage = () => {
  const { id: tripId } = useParams();
  const [viewMode, setViewMode] = useState('destinations'); // 'destinations', 'route', 'heatmap'
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  // Fetch trip data
  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsAPI.getTrip(tripId)
  });

  // Fetch destinations
  const { data: destinations } = useQuery({
    queryKey: ['destinations', tripId],
    queryFn: () => tripsAPI.getTripDestinations(tripId),
    enabled: !!tripId
  });

  // Calculate map bounds based on destinations
  useEffect(() => {
    if (destinations?.length > 0) {
      const validDests = destinations.filter(d => d.latitude && d.longitude);
      if (validDests.length > 0) {
        const lats = validDests.map(d => d.latitude);
        const lngs = validDests.map(d => d.longitude);
        
        const center = [
          (Math.min(...lats) + Math.max(...lats)) / 2,
          (Math.min(...lngs) + Math.max(...lngs)) / 2
        ];
        setMapCenter(center);
        setMapZoom(calculateZoom(lats, lngs));
      }
    }
  }, [destinations]);

  const calculateZoom = (lats, lngs) => {
    const latDiff = Math.max(...lats) - Math.min(...lats);
    const lngDiff = Math.max(...lngs) - Math.min(...lngs);
    const maxDiff = Math.max(latDiff, lngDiff);
    
    if (maxDiff < 0.5) return 10;
    if (maxDiff < 2) return 8;
    if (maxDiff < 10) return 5;
    return 3;
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MapIcon className="h-6 w-6 text-primary-600 mr-2" />
                {trip?.title} - Interactive Map
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Powered by OpenStreetMap (Free & Open Source)
              </p>
            </div>
            
            {/* View Mode Selector */}
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('destinations')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'destinations'
                    ? 'bg-white text-primary-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Destinations
              </button>
              <button
                onClick={() => setViewMode('route')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'route'
                    ? 'bg-white text-primary-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Route
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'heatmap'
                    ? 'bg-white text-primary-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Heatmap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[calc(100vh-120px)]">
        {viewMode === 'destinations' && (
          <OSMmap
            destinations={destinations?.filter(d => d.latitude && d.longitude) || []}
            center={mapCenter}
            zoom={mapZoom}
            onMarkerClick={setSelectedDestination}
          />
        )}
        
        {viewMode === 'route' && (
          <OSMRouteMap
            destinations={destinations?.filter(d => d.latitude && d.longitude) || []}
            center={mapCenter}
            zoom={mapZoom}
          />
        )}
        
        {viewMode === 'heatmap' && (
          <OSMHeatMap
            destinations={destinations?.filter(d => d.latitude && d.longitude) || []}
            center={mapCenter}
            zoom={mapZoom}
          />
        )}

        {/* Map Controls */}
        <OSMMapControls
          onZoomIn={() => setMapZoom(z => Math.min(z + 1, 18))}
          onZoomOut={() => setMapZoom(z => Math.max(z - 1, 2))}
          onRecenter={() => setMapCenter([20, 0])}
        />

        {/* Directions Panel (visible in route mode) */}
        {viewMode === 'route' && destinations?.filter(d => d.latitude && d.longitude).length > 1 && (
          <OSMDirections
            destinations={destinations.filter(d => d.latitude && d.longitude)}
            className="absolute top-4 left-4 w-80 bg-white rounded-lg shadow-lg max-h-[calc(100%-2rem)] overflow-y-auto"
          />
        )}
      </div>

      {/* Free Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        © OpenStreetMap contributors
      </div>
    </div>
  );
};

export default TripMapPage;