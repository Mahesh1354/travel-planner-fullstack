// src/components/maps/OSMDirections.jsx
import React, { useState } from 'react';
import { 
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon 
} from '@heroicons/react/24/outline';

const OSMDirections = ({ destinations, className }) => {
  const [expanded, setExpanded] = useState(true);

  const calculateDistance = (d1, d2) => {
    if (!d1.latitude || !d1.longitude || !d2.latitude || !d2.longitude) return 'N/A';
    
    const R = 6371; // Earth's radius in km
    const lat1 = d1.latitude * Math.PI / 180;
    const lat2 = d2.latitude * Math.PI / 180;
    const dLat = (d2.latitude - d1.latitude) * Math.PI / 180;
    const dLon = (d2.longitude - d1.longitude) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return (R * c).toFixed(1) + ' km';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-semibold">Route Directions</h3>
        {expanded ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </div>

      {expanded && (
        <>
          {/* Destinations List */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {destinations.map((dest, index) => (
              <div key={dest.id || index}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-700">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {dest.name || dest.city}
                    </p>
                    <p className="text-sm text-gray-500">
                      {dest.city}, {dest.country}
                    </p>
                    
                    {/* Distance to next destination */}
                    {index < destinations.length - 1 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">To next:</span>
                          <span className="font-medium text-gray-900">
                            {calculateDistance(dest, destinations[index + 1])}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow between destinations */}
                {index < destinations.length - 1 && (
                  <div className="ml-3 my-2">
                    <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600">
              Total stops: {destinations.length}
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              Total distance: {destinations.reduce((acc, dest, i) => {
                if (i < destinations.length - 1) {
                  const dist = calculateDistance(dest, destinations[i + 1]);
                  const numDist = parseFloat(dist);
                  return acc + (isNaN(numDist) ? 0 : numDist);
                }
                return acc;
              }, 0).toFixed(1)} km
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default OSMDirections;