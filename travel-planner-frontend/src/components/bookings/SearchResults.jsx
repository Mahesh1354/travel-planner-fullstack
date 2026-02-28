import React, { useState, useMemo } from "react";
import {
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon,
  WifiIcon,
  FireIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  BeakerIcon,
  SparklesIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

const SearchResults = ({ results, type, onSelect, onBook, onFavorite }) => {
  const [sortBy, setSortBy] = useState("price");
  const [selectedId, setSelectedId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const itemsPerPage = 5;

  const formatCurrency = (amount, currency = "USD") => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    
    if (typeof duration === 'string' && duration.startsWith('PT')) {
      const hours = duration.match(/(\d+)H/);
      const minutes = duration.match(/(\d+)M/);
      
      let result = "";
      if (hours) result += `${hours[1]}h `;
      if (minutes) result += `${minutes[1]}m`;
      return result.trim() || "N/A";
    }
    
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const mins = duration % 60;
      return `${hours}h ${mins}m`;
    }
    
    return String(duration);
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "--:--";
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return "--:--";
    }
  };

  const getImageUrl = (item) => {
    if (item.image) return item.image;
    if (item.images && item.images.length > 0) return item.images[0];
    
    const defaults = {
      flights: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&auto=format',
      hotels: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format',
      activities: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=200&auto=format'
    };
    
    return defaults[type] || 'https://via.placeholder.com/150';
  };

  const handleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
    if (onFavorite) onFavorite(id);
  };

  // Get amenity icon
  const getAmenityIcon = (amenity) => {
    const icons = {
      'wifi': <WifiIcon className="h-4 w-4" />,
      'breakfast': <FireIcon className="h-4 w-4" />,
      'parking': <BuildingOfficeIcon className="h-4 w-4" />,
      'pool': <BeakerIcon className="h-4 w-4" />,
      'gym': '🏋️',
      'spa': '💆',
      'restaurant': '🍽️',
      'bar': '🍸',
      'roomService': '🔑',
    };
    return icons[amenity] || amenity;
  };

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // Apply price filter
    filtered = filtered.filter(item => {
      const price = item.price || item.pricePerNight || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Apply amenities filter for hotels
    if (type === 'hotels' && selectedAmenities.length > 0) {
      filtered = filtered.filter(hotel => 
        selectedAmenities.every(amenity => 
          hotel.amenities?.includes(amenity)
        )
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price":
        filtered.sort((a, b) => (a.price || a.pricePerNight || 0) - (b.price || b.pricePerNight || 0));
        break;
      case "price-desc":
        filtered.sort((a, b) => (b.price || b.pricePerNight || 0) - (a.price || a.pricePerNight || 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "duration":
        if (type === "flights") {
          filtered.sort((a, b) => {
            const aDuration = a.duration ? a.duration.toString().length : 0;
            const bDuration = b.duration ? b.duration.toString().length : 0;
            return aDuration - bDuration;
          });
        }
        break;
    }

    return filtered;
  }, [results, sortBy, priceRange, selectedAmenities, type]);

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderFlightCard = (flight) => {
    const isFavorite = favorites.includes(flight.id);
    
    return (
      <div
        key={flight.id}
        className={`group relative bg-white dark:bg-gray-800 border-2 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer ${
          selectedId === flight.id
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
        }`}
        onClick={() => setSelectedId(flight.id)}
      >
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFavorite(flight.id);
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isFavorite ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            {/* Airline Info */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl flex items-center justify-center mr-4">
                <span className="text-xl font-bold text-primary-700 dark:text-primary-400">
                  {flight.airline?.substring(0, 2) || 'FL'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {flight.airline || 'Unknown Airline'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Flight {flight.flightNumber || 'N/A'} • {flight.aircraft || 'Airbus'}
                </p>
              </div>
            </div>

            {/* Flight Route */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(flight.departureTime)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{flight.origin || 'N/A'}</p>
                <p className="text-xs text-gray-400">{flight.originTerminal ? `Terminal ${flight.originTerminal}` : ''}</p>
              </div>

              <div className="flex-1 mx-6">
                <div className="relative">
                  <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-600 w-full"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border-2 border-gray-200 dark:border-gray-700">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {formatDuration(flight.duration)}
                    </span>
                  </div>
                </div>
                {flight.stops > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                    {flight.stops} {flight.stops === 1 ? "stop" : "stops"} • {flight.layover || 'No layover info'}
                  </p>
                )}
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(flight.arrivalTime)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{flight.destination || 'N/A'}</p>
                <p className="text-xs text-gray-400">{flight.destinationTerminal ? `Terminal ${flight.destinationTerminal}` : ''}</p>
              </div>
            </div>

            {/* Flight Features */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              {flight.baggage && (
                <span className="flex items-center">
                  <BriefcaseIcon className="h-4 w-4 mr-1" />
                  {flight.baggage}
                </span>
              )}
              {flight.meal && (
                <span className="flex items-center">
                  <FireIcon className="h-4 w-4 mr-1" />
                  {flight.meal}
                </span>
              )}
              {flight.refundable && (
                <span className="text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Refundable
                </span>
              )}
            </div>
          </div>

          {/* Price and Book Button */}
          <div className="mt-4 lg:mt-0 lg:ml-6 text-right">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(flight.price, flight.currency)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">per person</p>
            {flight.availableSeats && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {flight.availableSeats} seats left
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons (visible when selected) */}
        {selectedId === flight.id && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 animate-slide-down">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(flight);
              }} 
              className="px-6 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors font-medium"
            >
              Save for Later
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBook(flight);
              }} 
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Book Now
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderHotelCard = (hotel) => {
    const isFavorite = favorites.includes(hotel.hotelId || hotel.id);
    const price = hotel.pricePerNight || hotel.price || 0;
    
    return (
      <div
        key={hotel.hotelId || hotel.id}
        className={`group relative bg-white dark:bg-gray-800 border-2 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer ${
          selectedId === (hotel.hotelId || hotel.id)
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
        }`}
        onClick={() => setSelectedId(hotel.hotelId || hotel.id)}
      >
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFavorite(hotel.hotelId || hotel.id);
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
        >
          {isFavorite ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Hotel Image */}
          <div className="md:w-48 h-48 rounded-xl overflow-hidden">
            <img
              src={getImageUrl(hotel)}
              alt={hotel.hotelName || hotel.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
          </div>

          <div className="md:ml-6 flex-1">
            {/* Hotel Info */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {hotel.hotelName || hotel.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {hotel.city || hotel.address || "Location N/A"}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) =>
                  star <= (hotel.rating || 0) ? (
                    <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <StarIcon key={star} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                  ),
                )}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                ({hotel.reviewCount || 0} reviews)
              </span>
            </div>

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs"
                  >
                    {typeof getAmenityIcon(amenity) === 'string' ? (
                      <span className="mr-1">{getAmenityIcon(amenity)}</span>
                    ) : (
                      React.cloneElement(getAmenityIcon(amenity), { className: "h-3 w-3 mr-1" })
                    )}
                    {amenity}
                  </span>
                ))}
                {hotel.amenities.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs">
                    +{hotel.amenities.length - 4} more
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(price, hotel.currency)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">per night</p>
              </div>
              {hotel.availableRooms > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {hotel.availableRooms} rooms left
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons (visible when selected) */}
        {selectedId === (hotel.hotelId || hotel.id) && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 animate-slide-down">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(hotel);
              }} 
              className="px-6 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors font-medium"
            >
              Save for Later
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBook(hotel);
              }} 
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Book Now
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderActivityCard = (activity) => {
    const isFavorite = favorites.includes(activity.id);
    
    return (
      <div
        key={activity.id}
        className={`group relative bg-white dark:bg-gray-800 border-2 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer ${
          selectedId === activity.id
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
        }`}
        onClick={() => setSelectedId(activity.id)}
      >
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFavorite(activity.id);
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
        >
          {isFavorite ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Activity Image */}
          <div className="md:w-48 h-48 rounded-xl overflow-hidden">
            <img
              src={getImageUrl(activity)}
              alt={activity.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
          </div>

          <div className="md:ml-6 flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {activity.name}
            </h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-3">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {activity.location || "Location N/A"}
            </p>

            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatDuration(activity.duration)}
              </div>

              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) =>
                  star <= (activity.rating || 0) ? (
                    <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <StarIcon key={star} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                  ),
                )}
              </div>
            </div>

            {/* Highlights */}
            {activity.highlights && activity.highlights.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Highlights:</p>
                <div className="flex flex-wrap gap-1">
                  {activity.highlights.slice(0, 3).map((highlight, idx) => (
                    <span key={idx} className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs">
                      <SparklesIcon className="h-3 w-3 mr-1" />
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(activity.price, activity.currency)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">per person</p>
              </div>
              {activity.availableSpots > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {activity.availableSpots} spots left
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons (visible when selected) */}
        {selectedId === activity.id && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 animate-slide-down">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelect(activity);
              }} 
              className="px-6 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors font-medium"
            >
              Save for Later
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBook(activity);
              }} 
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Book Now
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No results found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search criteria or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Results Count and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {filteredResults.length} results found
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
          >
            <option value="price">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="rating">Rating (High to Low)</option>
            {type === "flights" && (
              <option value="duration">Duration (Shortest)</option>
            )}
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
            <button
              onClick={() => {
                setPriceRange({ min: 0, max: 10000 });
                setSelectedAmenities([]);
              }}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear all
            </button>
          </div>

          {/* Price Range */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Amenities Filter (for hotels) */}
          {type === 'hotels' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {['wifi', 'breakfast', 'parking', 'pool', 'gym'].map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => setSelectedAmenities(prev =>
                      prev.includes(amenity)
                        ? prev.filter(a => a !== amenity)
                        : [...prev, amenity]
                    )}
                    className={`flex items-center px-3 py-1 rounded-lg text-sm border-2 transition-all ${
                      selectedAmenities.includes(amenity)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {amenity === 'wifi' && <WifiIcon className="h-4 w-4 mr-1" />}
                    {amenity === 'breakfast' && <FireIcon className="h-4 w-4 mr-1" />}
                    {amenity === 'parking' && <BuildingOfficeIcon className="h-4 w-4 mr-1" />}
                    {amenity === 'pool' && <BeakerIcon className="h-4 w-4 mr-1" />}
                    {amenity === 'gym' && '🏋️'}
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {paginatedResults.map((result) => {
          switch (type) {
            case "flights":
              return renderFlightCard(result);
            case "hotels":
              return renderHotelCard(result);
            case "activities":
              return renderActivityCard(result);
            default:
              return null;
          }
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                currentPage === i + 1
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;