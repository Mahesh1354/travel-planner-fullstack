import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Common travel destinations including many Indian cities
const COMMON_DESTINATIONS = [
  // Indian Destinations
  'Kerala, India',
  'Kochi, India',
  'Alleppey, India',
  'Munnar, India',
  'Kovalam, India',
  'Goa, India',
  'Mumbai, India',
  'Delhi, India',
  'Jaipur, India',
  'Agra, India',
  'Varanasi, India',
  'Kolkata, India',
  'Chennai, India',
  'Bangalore, India',
  'Hyderabad, India',
  'Pune, India',
  'Udaipur, India',
  'Jodhpur, India',
  'Rishikesh, India',
  'Manali, India',
  'Shimla, India',
  'Darjeeling, India',
  'Sikkim, India',
  'Ladakh, India',
  'Andaman Islands, India',
  
  // International Destinations
  'Paris, France',
  'London, United Kingdom',
  'New York, USA',
  'Los Angeles, USA',
  'Tokyo, Japan',
  'Rome, Italy',
  'Barcelona, Spain',
  'Sydney, Australia',
  'Bangkok, Thailand',
  'Dubai, UAE',
  'Singapore',
  'Hong Kong, China',
  'Bali, Indonesia',
  'Phuket, Thailand',
  'Maldives',
  'Switzerland',
];

const LocationSearch = ({ value, onChange, onSelect }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const filtered = COMMON_DESTINATIONS.filter(dest =>
      dest.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 8);

    setSuggestions(filtered);
  }, [inputValue]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Call the parent's onChange with the new value
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSelect = (destination) => {
    setInputValue(destination);
    onChange(destination);
    if (onSelect) {
      onSelect({ formatted: destination });
    }
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          placeholder="Search for a city or country..."
          className="input-field pl-10 pr-10"
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {suggestions.map((destination, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(destination)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start space-x-3 border-b border-gray-100 last:border-0"
            >
              <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-900">{destination}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;