// src/components/maps/OSMSearch.jsx
import React, { useState } from 'react';
import L from 'leaflet';
import 'leaflet-control-geocoder';

const OSMSearch = ({ map, onLocationSelect, className }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchLocations = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (location) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    
    onLocationSelect({
      lat,
      lon,
      name: location.display_name
    });

    setQuery(location.display_name);
    setResults([]);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchLocations(e.target.value);
          }}
          placeholder="Search for a location..."
          className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-[1000]">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col border-b border-gray-100 last:border-0"
            >
              <span className="text-sm font-medium text-gray-900">
                {result.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OSMSearch;