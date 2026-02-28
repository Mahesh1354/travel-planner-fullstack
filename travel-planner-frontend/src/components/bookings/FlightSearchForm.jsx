import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  CalendarIcon, 
  UsersIcon, 
  ArrowsRightLeftIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BuildingOfficeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import bookingsAPI from '../../api/bookings';
import debounce from 'lodash/debounce';

const FlightSearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: new Date(),
    returnDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'ECONOMY',
    tripType: 'roundtrip',
  });

  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [showOriginResults, setShowOriginResults] = useState(false);
  const [showDestResults, setShowDestResults] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDest, setSelectedDest] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentFlightSearches');
    return saved ? JSON.parse(saved) : [];
  });

  // Search airports for origin
  const { data: originAirports, isLoading: originLoading, refetch: refetchOrigin } = useQuery({
    queryKey: ['airports', originQuery],
    queryFn: () => bookingsAPI.searchAirports(originQuery),
    enabled: false,
  });

  // Search airports for destination
  const { data: destAirports, isLoading: destLoading, refetch: refetchDest } = useQuery({
    queryKey: ['airports', destQuery],
    queryFn: () => bookingsAPI.searchAirports(destQuery),
    enabled: false,
  });

  // Debounced search functions
  const debouncedSearchOrigin = debounce(() => {
    if (originQuery.length > 1) {
      refetchOrigin();
    }
  }, 300);

  const debouncedSearchDest = debounce(() => {
    if (destQuery.length > 1) {
      refetchDest();
    }
  }, 300);

  useEffect(() => {
    if (originQuery.length > 1) {
      debouncedSearchOrigin();
    }
    return () => debouncedSearchOrigin.cancel();
  }, [originQuery]);

  useEffect(() => {
    if (destQuery.length > 1) {
      debouncedSearchDest();
    }
    return () => debouncedSearchDest.cancel();
  }, [destQuery]);

  const handleOriginChange = (e) => {
    const value = e.target.value;
    setOriginQuery(value);
    setShowOriginResults(true);
    if (!selectedOrigin || selectedOrigin.code !== value) {
      setFormData(prev => ({ ...prev, origin: '' }));
      setSelectedOrigin(null);
    }
  };

  const handleDestChange = (e) => {
    const value = e.target.value;
    setDestQuery(value);
    setShowDestResults(true);
    if (!selectedDest || selectedDest.code !== value) {
      setFormData(prev => ({ ...prev, destination: '' }));
      setSelectedDest(null);
    }
  };

  const selectOrigin = (airport) => {
    setSelectedOrigin(airport);
    setOriginQuery(`${airport.code} - ${airport.city} (${airport.name})`);
    setFormData(prev => ({ ...prev, origin: airport.code }));
    setShowOriginResults(false);
  };

  const selectDestination = (airport) => {
    setSelectedDest(airport);
    setDestQuery(`${airport.code} - ${airport.city} (${airport.name})`);
    setFormData(prev => ({ ...prev, destination: airport.code }));
    setShowDestResults(false);
  };

  const clearOrigin = () => {
    setSelectedOrigin(null);
    setOriginQuery('');
    setFormData(prev => ({ ...prev, origin: '' }));
    setShowOriginResults(false);
  };

  const clearDestination = () => {
    setSelectedDest(null);
    setDestQuery('');
    setFormData(prev => ({ ...prev, destination: '' }));
    setShowDestResults(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.origin || !formData.destination) {
      alert('Please select valid airports from the dropdown');
      return;
    }

    const searchData = {
      ...formData,
      departureDate: formData.departureDate.toISOString().split('T')[0],
      returnDate: formData.tripType === 'roundtrip' ? formData.returnDate.toISOString().split('T')[0] : undefined,
    };

    // Save to recent searches
    const newRecent = [searchData, ...recentSearches.slice(0, 4)];
    setRecentSearches(newRecent);
    localStorage.setItem('recentFlightSearches', JSON.stringify(newRecent));

    onSearch(searchData);
  };

  const swapLocations = () => {
    setFormData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
    
    setSelectedOrigin(selectedDest);
    setSelectedDest(selectedOrigin);
    setOriginQuery(selectedDest ? `${selectedDest.code} - ${selectedDest.city} (${selectedDest.name})` : '');
    setDestQuery(selectedOrigin ? `${selectedOrigin.code} - ${selectedOrigin.city} (${selectedOrigin.name})` : '');
  };

  const totalPassengers = formData.adults + formData.children + formData.infants;

  const cabinClasses = [
    { value: 'ECONOMY', label: 'Economy', icon: '💺' },
    { value: 'PREMIUM_ECONOMY', label: 'Premium Economy', icon: '✨' },
    { value: 'BUSINESS', label: 'Business', icon: '💼' },
    { value: 'FIRST', label: 'First Class', icon: '👑' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recent Searches
          </label>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    origin: search.origin,
                    destination: search.destination,
                    adults: search.adults,
                    cabinClass: search.cabinClass,
                  }));
                  setSelectedOrigin({ code: search.origin, city: search.originCity });
                  setSelectedDest({ code: search.destination, city: search.destinationCity });
                }}
                className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <SparklesIcon className="h-3 w-3 mr-1 text-primary-500" />
                {search.origin} → {search.destination}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trip Type */}
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="tripType"
            value="roundtrip"
            checked={formData.tripType === 'roundtrip'}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Round Trip</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="tripType"
            value="oneway"
            checked={formData.tripType === 'oneway'}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">One Way</span>
        </label>
      </div>

      {/* Locations */}
      <div className="grid md:grid-cols-5 gap-4 items-start">
        {/* Origin */}
        <div className="md:col-span-2 relative">
          <label htmlFor="origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            From <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="origin"
              value={originQuery}
              onChange={handleOriginChange}
              onFocus={() => setShowOriginResults(true)}
              placeholder="Search for city or airport"
              className="w-full pl-9 pr-8 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
              autoComplete="off"
              required
            />
            {originQuery && (
              <button
                type="button"
                onClick={clearOrigin}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Origin Autocomplete Results */}
          {showOriginResults && originQuery.length > 1 && (
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
              {originLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Searching...
                </div>
              ) : originAirports?.data?.length > 0 ? (
                originAirports.data.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => selectOrigin(airport)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {airport.code} - {airport.city}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {airport.name}, {airport.country}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">No airports found</div>
              )}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center pt-7">
          <button
            type="button"
            onClick={swapLocations}
            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            aria-label="Swap locations"
            disabled={!selectedOrigin || !selectedDest}
          >
            <ArrowsRightLeftIcon className="h-5 w-5 text-gray-500 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* Destination */}
        <div className="md:col-span-2 relative">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            To <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="destination"
              value={destQuery}
              onChange={handleDestChange}
              onFocus={() => setShowDestResults(true)}
              placeholder="Search for city or airport"
              className="w-full pl-9 pr-8 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
              autoComplete="off"
              required
            />
            {destQuery && (
              <button
                type="button"
                onClick={clearDestination}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Destination Autocomplete Results */}
          {showDestResults && destQuery.length > 1 && (
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
              {destLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Searching...
                </div>
              ) : destAirports?.data?.length > 0 ? (
                destAirports.data.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => selectDestination(airport)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {airport.code} - {airport.city}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {airport.name}, {airport.country}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">No airports found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Airports Display */}
      {(selectedOrigin || selectedDest) && (
        <div className="flex flex-wrap gap-2 text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
          {selectedOrigin && (
            <span className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full">
              <BuildingOfficeIcon className="h-3 w-3 mr-1" />
              From: {selectedOrigin.code} - {selectedOrigin.city}
            </span>
          )}
          {selectedDest && (
            <span className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full">
              <BuildingOfficeIcon className="h-3 w-3 mr-1" />
              To: {selectedDest.code} - {selectedDest.city}
            </span>
          )}
        </div>
      )}

      {/* Dates */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Departure Date <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors z-10" />
            <DatePicker
              id="departureDate"
              selected={formData.departureDate}
              onChange={(date) => setFormData(prev => ({ ...prev, departureDate: date }))}
              minDate={new Date()}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
              dateFormat="MMMM d, yyyy"
              required
            />
          </div>
        </div>

        {formData.tripType === 'roundtrip' && (
          <div>
            <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Return Date <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors z-10" />
              <DatePicker
                id="returnDate"
                selected={formData.returnDate}
                onChange={(date) => setFormData(prev => ({ ...prev, returnDate: date }))}
                minDate={formData.departureDate}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
                dateFormat="MMMM d, yyyy"
                required
              />
            </div>
          </div>
        )}
      </div>

      {/* Passengers Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Passengers</span>
          <span className="text-sm text-primary-600">{totalPassengers} total</span>
        </div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
        >
          <span>{formData.adults} Adult, {formData.children} Child, {formData.infants} Infant</span>
          {showAdvanced ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>

        {/* Advanced Passenger Options */}
        {showAdvanced && (
          <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Adults (12+ years)</label>
              <select
                name="adults"
                value={formData.adults}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Children (2-11 years)</label>
              <select
                name="children"
                value={formData.children}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
              >
                {[0, 1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Infants (under 2 years)</label>
              <select
                name="infants"
                value={formData.infants}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
              >
                {[0, 1, 2].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Cabin Class */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cabin Class
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {cabinClasses.map((cabin) => (
            <button
              key={cabin.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, cabinClass: cabin.value }))}
              className={`p-3 border-2 rounded-xl text-center transition-all ${
                formData.cabinClass === cabin.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-200'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-2xl mb-1 block">{cabin.icon}</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cabin.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!formData.origin || !formData.destination}
      >
        Search Flights
      </button>
    </form>
  );
};

export default FlightSearchForm;