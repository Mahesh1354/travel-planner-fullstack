import React, { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Add useNavigate
import { useQuery } from "@tanstack/react-query";
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
  SparklesIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from "@headlessui/react";
import { formatDate, getStatusColor, truncateText, calculateProgress } from "../../utils/helpers";
import weatherAPI from '../../api/weather';

const TripCard = ({ trip, onDelete, onDuplicate, onFavorite, onShare, onQuickView }) => {
  const navigate = useNavigate(); // Add this
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(trip?.isFavorite || false);

  // If trip is null or undefined, don't render
  if (!trip) {
    return null;
  }

  // Provide default values for all properties
  const {
    id,
    title = 'Untitled Trip',
    description = '',
    destination = '',
    startDate,
    endDate,
    coverImage,
    isPublic = false,
    status = 'PLANNING',
    collaborators = [],
    destinations = [],
    budget,
    activities = [],
    completedItems = 0,
    totalItems = 0,
    images = []
  } = trip;

  // Get the first destination name to display
  const getDisplayDestination = () => {
    if (destination) {
      return destination;
    }
    if (destinations && destinations.length > 0) {
      const firstDest = destinations[0];
      return `${firstDest.city || firstDest.name}${firstDest.country ? `, ${firstDest.country}` : ''}`;
    }
    return "No destination set";
  };

  // Get city for weather query
  const getCityForWeather = () => {
    if (destination) {
      return destination.split(',')[0].trim();
    }
    if (destinations && destinations.length > 0) {
      const firstDest = destinations[0];
      return firstDest.city || firstDest.name;
    }
    return null;
  };

  // Calculate trip progress
  const progress = calculateProgress(completedItems, totalItems);
  
  // Calculate days remaining or days ago
  const getTripTiming = () => {
    if (!startDate) return null;
    
    const today = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (start > today) {
      const daysUntil = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
      return { type: 'upcoming', value: daysUntil, text: `${daysUntil} days until trip` };
    } else if (end && end < today) {
      const daysAgo = Math.ceil((today - end) / (1000 * 60 * 60 * 24));
      return { type: 'past', value: daysAgo, text: `${daysAgo} days ago` };
    } else {
      return { type: 'ongoing', text: 'Ongoing' };
    }
  };

  // Fetch weather data with React Query caching
  const cityName = getCityForWeather();
  const { data: weather } = useQuery({
    queryKey: ['weather', cityName, 'current'],
    queryFn: async () => {
      if (!cityName) return null;
      try {
        const data = await weatherAPI.getCurrentWeather(cityName);
        return data;
      } catch (error) {
        console.log('Weather fetch failed:', error);
        return null;
      }
    },
    enabled: !!cityName,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const destinationCount = destinations?.length || 0;
  const displayDestination = getDisplayDestination();
  const duration = endDate && startDate
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
    : 0;
  const collaboratorsList = Array.isArray(collaborators) ? collaborators : [];
  const tripTiming = getTripTiming();

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    if (onFavorite) {
      onFavorite(id, newValue);
    }
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(trip);
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(trip);
    }
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/trip/${id}`);
  };

  return (
    <div 
      className="card group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <Link to={`/trip/${id}`} className="block relative h-48 overflow-hidden">
        {/* Main Image */}
        <img
          src={
            coverImage || images[0] ||
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format"
          }
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges Container */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Left Badges */}
          <div className="flex flex-wrap gap-2">
            {/* Status Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${getStatusColor(status)}`}
            >
              {status}
            </span>

            {/* Progress Badge (if trip is in progress) */}
            {progress > 0 && progress < 100 && (
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm flex items-center">
                <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                {progress}%
              </span>
            )}
          </div>

          {/* Right Badges */}
          <div className="flex gap-2">
            {/* Public/Private Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
                isPublic
                  ? "bg-green-500/90 text-white"
                  : "bg-gray-600/90 text-white"
              }`}
            >
              {isPublic ? "🌍 Public" : "🔒 Private"}
            </span>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
            >
              {isFavorite ? (
                <HeartIconSolid className="h-4 w-4 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Actions Overlay (appears on hover) - FIXED: Replaced Link with button */}
        <div className={`absolute inset-0 flex items-center justify-center gap-3 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleQuickView}
            className="p-3 bg-white rounded-full hover:bg-primary-600 hover:text-white transition-colors transform hover:scale-110"
            title="Quick view"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleShareClick}
            className="p-3 bg-white rounded-full hover:bg-primary-600 hover:text-white transition-colors transform hover:scale-110"
            title="Share trip"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleViewDetails}
            className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors transform hover:scale-110"
            title="View details"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar (if applicable) */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </Link>

      {/* Content Section - REST OF THE COMPONENT STAYS THE SAME */}
      <div className="p-5">
        {/* Header with Title and Menu */}
        <div className="flex items-start justify-between mb-2">
          <Link to={`/trip/${id}`} className="flex-1 group/title">
            <h3 className="text-xl font-semibold text-gray-900 group-hover/title:text-primary-600 transition-colors line-clamp-1">
              {title}
            </h3>
          </Link>

          {/* Options Menu */}
          <Menu as="div" className="relative">
            <MenuButton className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
            </MenuButton>
            
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  <MenuItem>
                    {({ focus }) => (
                      <Link
                        to={`/edit-trip/${id}`}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        Edit Trip
                      </Link>
                    )}
                  </MenuItem>
                  
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => onDuplicate(id)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        Duplicate Trip
                      </button>
                    )}
                  </MenuItem>
                  
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => onDelete(id)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          focus ? 'bg-gray-100 text-red-700' : 'text-red-600'
                        }`}
                      >
                        Delete Trip
                      </button>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Transition>
          </Menu>
        </div>

        {/* Destination and Weather Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-600 min-w-0">
            <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0 text-gray-400" />
            <span className="text-sm truncate">
              {displayDestination}
              {destinationCount > 1 && (
                <span className="ml-1 text-xs text-gray-400">
                  +{destinationCount - 1} more
                </span>
              )}
            </span>
          </div>
          
          {/* Weather Display */}
          {weather?.temperature && weather?.icon && (
            <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 px-2 py-1 rounded-full border border-blue-200">
              <img 
                src={`https://openweathermap.org/img/wn/${weather.icon}.png`} 
                alt="weather" 
                className="w-5 h-5"
              />
              <span className="text-xs font-medium text-blue-700 ml-1">{weather.temperature}°C</span>
            </div>
          )}
        </div>

        {/* Trip Timing Badge */}
        {tripTiming && (
          <div className={`mb-3 flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit ${
            tripTiming.type === 'upcoming' ? 'bg-green-100 text-green-700' :
            tripTiming.type === 'past' ? 'bg-gray-100 text-gray-600' :
            'bg-blue-100 text-blue-700'
          }`}>
            <ClockIcon className="h-3 w-3" />
            <span>{tripTiming.text}</span>
          </div>
        )}

        {/* Destination Preview Chips */}
        {destinations && destinations.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {destinations.slice(0, 3).map((dest, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center"
              >
                <MapPinIcon className="h-3 w-3 mr-1 text-gray-500" />
                {dest.city || dest.name}
              </span>
            ))}
            {destinations.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                +{destinations.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">
            {truncateText(description, 100)}
          </p>
        )}

        {/* Trip Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <CalendarIcon className="h-4 w-4 mx-auto mb-1 text-gray-500" />
            <p className="text-xs font-medium text-gray-700">{duration} days</p>
          </div>
          {budget && (
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <CurrencyDollarIcon className="h-4 w-4 mx-auto mb-1 text-gray-500" />
              <p className="text-xs font-medium text-gray-700">${budget}</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <BuildingOfficeIcon className="h-4 w-4 mx-auto mb-1 text-gray-500" />
            <p className="text-xs font-medium text-gray-700">{destinationCount} stops</p>
          </div>
        </div>

        {/* Trip Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
            <span className="text-sm">
              {startDate ? formatDate(startDate) : "TBD"}
              {endDate && ` - ${formatDate(endDate)}`}
            </span>
          </div>

          {collaboratorsList.length > 0 && (
            <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
              <UserGroupIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
              <span className="text-sm">
                {collaboratorsList.length + 1} traveler{ collaboratorsList.length > 0 ? "s" : "" }
              </span>
            </div>
          )}
        </div>

        {/* Collaborator Avatars */}
        {collaboratorsList.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex -space-x-2">
              {/* Owner avatar (you) */}
              <div className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center shadow-sm">
                <span className="text-xs font-medium text-primary-600">
                  You
                </span>
              </div>

              {/* Collaborator avatars */}
              {collaboratorsList.slice(0, 4).map((collab, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  title={`${collab?.firstName || ''} ${collab?.lastName || ''}`}
                >
                  {collab?.profileImage ? (
                    <img 
                      src={collab.profileImage} 
                      alt={collab.firstName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-gray-700">
                      {collab?.firstName?.[0] || ''}
                      {collab?.lastName?.[0] || ''}
                    </span>
                  )}
                </div>
              ))}

              {collaboratorsList.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center shadow-sm">
                  <span className="text-xs font-medium text-gray-600">
                    +{collaboratorsList.length - 4}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            {activities?.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <SparklesIcon className="h-3 w-3 mr-1 text-yellow-500" />
                <span>{activities.length} activities</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripCard;