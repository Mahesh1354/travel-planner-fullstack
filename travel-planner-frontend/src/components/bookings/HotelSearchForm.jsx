import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  CalendarIcon,
  UsersIcon,
  MapPinIcon,
  StarIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  HomeIcon,
  WifiIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  KeyIcon,
  PhoneIcon,
  ClockIcon,
  FireIcon,
  BeakerIcon,
  HeartIcon
} from "@heroicons/react/24/outline";
import bookingsAPI from '../../api/bookings';

const HotelSearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    location: "",
    locationCode: "",
    checkIn: new Date(),
    checkOut: new Date(new Date().setDate(new Date().getDate() + 3)),
    guests: 2,
    rooms: 1,
    minPrice: "",
    maxPrice: "",
    minRating: 3,
    amenities: [],
    propertyType: "any",
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentHotelSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search for locations/cities
  const searchLocations = async (keyword) => {
    if (keyword.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    setSearchingLocation(true);
    try {
      const response = await bookingsAPI.searchAirports(keyword);
      const data = response.data || [];

      const suggestions = data
        .filter((item) => item.city && item.code)
        .map((item) => ({
          code: item.code,
          city: item.city,
          name: item.name,
          country: item.country,
          display: `${item.city} (${item.code}) - ${item.country}`,
        }))
        .filter(
          (item, index, self) =>
            index === self.findIndex((i) => i.code === item.code),
        );

      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error("Error searching locations:", error);
      setLocationSuggestions([]);
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      location: value,
      locationCode: "",
    }));
    searchLocations(value);
    setShowSuggestions(true);
  };

  const handleSuggestionSelect = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      location: suggestion.display,
      locationCode: suggestion.code,
    }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.locationCode) {
      alert("Please select a location from the suggestions");
      return;
    }

    const searchData = {
      location: formData.locationCode,
      locationDisplay: formData.location,
      checkIn: formData.checkIn.toISOString().split("T")[0],
      checkOut: formData.checkOut.toISOString().split("T")[0],
      guests: formData.guests,
      rooms: formData.rooms,
      minPrice: formData.minPrice ? Number(formData.minPrice) : undefined,
      maxPrice: formData.maxPrice ? Number(formData.maxPrice) : undefined,
      minRating: formData.minRating,
      amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
      propertyType: formData.propertyType !== 'any' ? formData.propertyType : undefined,
    };

    const newRecent = [searchData, ...recentSearches.slice(0, 4)];
    setRecentSearches(newRecent);
    localStorage.setItem("recentHotelSearches", JSON.stringify(newRecent));

    onSearch(searchData);
  };

  const loadRecentSearch = (recent) => {
    setFormData({
      location: recent.locationDisplay || recent.location,
      locationCode: recent.location,
      checkIn: new Date(recent.checkIn),
      checkOut: new Date(recent.checkOut),
      guests: recent.guests,
      rooms: recent.rooms,
      minPrice: recent.minPrice || "",
      maxPrice: recent.maxPrice || "",
      minRating: recent.minRating || 3,
      amenities: recent.amenities || [],
      propertyType: recent.propertyType || 'any',
    });
  };

  // Amenities with proper icons and emoji fallbacks
  const amenities = [
    { id: 'wifi', label: 'Free WiFi', icon: WifiIcon, fallback: '📶' },
    { id: 'breakfast', label: 'Breakfast', icon: FireIcon, fallback: '🍳' },
    { id: 'parking', label: 'Parking', icon: BuildingOfficeIcon, fallback: '🅿️' },
    { id: 'pool', label: 'Pool', icon: BeakerIcon, fallback: '🏊' },
    { id: 'spa', label: 'Spa', icon: HeartIcon, fallback: '💆' },
    { id: 'gym', label: 'Gym', icon: '🏋️', fallback: '🏋️' },
    { id: 'restaurant', label: 'Restaurant', icon: '🍽️', fallback: '🍽️' },
    { id: 'roomService', label: 'Room Service', icon: KeyIcon, fallback: '🔑' },
    { id: 'bar', label: 'Bar/Lounge', icon: BeakerIcon, fallback: '🍸' },
    { id: 'business', label: 'Business Center', icon: BuildingOfficeIcon, fallback: '💼' },
  ];

  const propertyTypes = [
    { value: 'any', label: 'Any type' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'resort', label: 'Resort' },
    { value: 'villa', label: 'Villa' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'boutique', label: 'Boutique Hotel' },
    { value: 'bedBreakfast', label: 'Bed & Breakfast' },
  ];

  const nights = Math.ceil((formData.checkOut - formData.checkIn) / (1000 * 60 * 60 * 24));

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
                onClick={() => loadRecentSearch(search)}
                className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <SparklesIcon className="h-3 w-3 mr-1 text-primary-500" />
                {search.locationDisplay || search.location}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Location */}
      <div className="relative">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Destination <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleLocationChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="City, landmark, or hotel name"
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
            required
            autoComplete="off"
          />
          {searchingLocation && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>

        {/* Location Suggestions */}
        {showSuggestions && (locationSuggestions.length > 0 || recentSearches.length > 0) && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {recentSearches.length > 0 && !formData.location && (
              <div>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Recent Searches
                </div>
                {recentSearches.map((recent, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => loadRecentSearch(recent)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {recent.locationDisplay || recent.location}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(recent.checkIn).toLocaleDateString()} - {new Date(recent.checkOut).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {locationSuggestions.length > 0 && (
              <div>
                {recentSearches.length > 0 && !formData.location && (
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-t border-gray-200 dark:border-gray-700">
                    Suggestions
                  </div>
                )}
                {locationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onMouseDown={() => handleSuggestionSelect(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {suggestion.city} ({suggestion.code})
                      </div>
                      <div className="text-xs text-gray-500">
                        {suggestion.name} · {suggestion.country}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {formData.locationCode && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
            <SparklesIcon className="h-3 w-3 mr-1" />
            Selected: {formData.locationCode}
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Check-in Date <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors z-10" />
            <DatePicker
              id="checkIn"
              selected={formData.checkIn}
              onChange={(date) => setFormData((prev) => ({ ...prev, checkIn: date }))}
              minDate={new Date()}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
              dateFormat="MMMM d, yyyy"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Check-out Date <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors z-10" />
            <DatePicker
              id="checkOut"
              selected={formData.checkOut}
              onChange={(date) => setFormData((prev) => ({ ...prev, checkOut: date }))}
              minDate={formData.checkIn}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
              dateFormat="MMMM d, yyyy"
              required
            />
          </div>
        </div>
      </div>

      {/* Nights Summary */}
      {nights > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 text-center">
          <p className="text-sm text-primary-700 dark:text-primary-300">
            {nights} {nights === 1 ? 'night' : 'nights'} stay
          </p>
        </div>
      )}

      {/* Guests & Rooms */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Guests <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <select
              id="guests"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none bg-white dark:bg-gray-800 dark:text-white"
              required
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Guest" : "Guests"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rooms <span className="text-red-500">*</span>
          </label>
          <select
            id="rooms"
            name="rooms"
            value={formData.rooms}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none bg-white dark:bg-gray-800 dark:text-white"
            required
          >
            {[1, 2, 3, 4].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "Room" : "Rooms"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        {showAdvanced ? (
          <>
            <ChevronUpIcon className="h-4 w-4 mr-1" />
            Hide advanced filters
          </>
        ) : (
          <>
            <ChevronDownIcon className="h-4 w-4 mr-1" />
            Show advanced filters
          </>
        )}
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl animate-slide-down">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              Price Range (per night)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="minPrice"
                value={formData.minPrice}
                onChange={handleChange}
                placeholder="Min price"
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                min="0"
              />
              <input
                type="number"
                name="maxPrice"
                value={formData.maxPrice}
                onChange={handleChange}
                placeholder="Max price"
                className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                min="0"
              />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <HomeIcon className="h-4 w-4 mr-1" />
              Property Type
            </label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
            >
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <StarIcon className="h-4 w-4 mr-1" />
              Minimum Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, minRating: rating }))}
                  className={`flex-1 py-2 border-2 rounded-lg text-center transition-all ${
                    formData.minRating === rating
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span className="text-yellow-400">{'★'.repeat(rating)}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{rating}+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <WifiIcon className="h-4 w-4 mr-1" />
              Amenities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((amenity) => {
                const Icon = amenity.icon;
                const isSelected = formData.amenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.id)}
                    className={`flex items-center p-2 border-2 rounded-lg transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {typeof Icon === 'string' ? (
                      <span className="text-lg mr-2">{Icon}</span>
                    ) : (
                      <Icon className={`h-5 w-5 mr-2 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{amenity.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-[1.02] shadow-lg ${
          !formData.locationCode ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={!formData.locationCode}
      >
        Search Hotels
      </button>
    </form>
  );
};

export default HotelSearchForm;