import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  CalendarIcon, 
  HomeIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
  SunIcon,
  CloudIcon,
  AcademicCapIcon,
  UserGroupIcon,
  EllipsisHorizontalIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { formatDate, calculateNights } from '../../utils/helpers';

const DestinationCard = ({ destination, tripId, onEdit, onDelete, onView }) => {
  const {
    id,
    name,
    country,
    city,
    arrivalDate,
    departureDate,
    accommodationName,
    accommodationAddress,
    notes,
    activities = [],
    latitude,
    longitude,
    weather // Optional weather data passed from parent
  } = destination;

  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);

  const activityCount = activities.length;
  const completedActivities = activities.filter(a => a.completed).length;
  const nights = calculateNights(arrivalDate, departureDate);
  
  // Get weather icon based on condition
  const getWeatherIcon = () => {
    if (!weather) return null;
    
    const condition = weather.condition?.toLowerCase() || '';
    if (condition.includes('sun') || condition.includes('clear')) 
      return <SunIcon className="h-4 w-4 text-yellow-500" />;
    if (condition.includes('cloud')) 
      return <CloudIcon className="h-4 w-4 text-gray-500" />;
    return <CloudIcon className="h-4 w-4 text-blue-500" />;
  };

  // Get destination image (using Unsplash or fallback)
  const getDestinationImage = () => {
    if (imageError) return null;
    
    // You can replace with your actual image URL from API
    const imageUrl = destination.imageUrl || 
      `https://source.unsplash.com/400x200/?${city},${country}&sig=${id}`;
    
    return (
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-32 object-cover"
        onError={() => setImageError(true)}
        loading="lazy"
      />
    );
  };

  return (
    <div className="card hover:shadow-xl transition-all duration-300 group">
      {/* Image Section (Optional) */}
      {!imageError && getDestinationImage() && (
        <div className="relative h-32 overflow-hidden rounded-t-xl">
          {getDestinationImage()}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Quick View Button */}
          <button
            onClick={() => onView?.(destination)}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            title="Quick view"
          >
            <EyeIcon className="h-4 w-4 text-gray-700" />
          </button>

          {/* Nights Badge */}
          {nights > 0 && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {nights} {nights === 1 ? 'night' : 'nights'}
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Header with Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                {name}
              </h3>
              
              {/* Activity Progress Badge */}
              {activityCount > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  completedActivities === activityCount
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {completedActivities}/{activityCount} done
                </span>
              )}
            </div>
            
            <p className="text-gray-600 flex items-center text-sm">
              <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{city}, {country}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all lg:hidden"
            >
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-1">
              <button
                onClick={() => onEdit(destination)}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Edit destination"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete destination"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Actions Dropdown */}
            {showActions && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 lg:hidden">
                <button
                  onClick={() => {
                    onEdit(destination);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <PencilIcon className="h-4 w-4 inline mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(id);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4 inline mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date Range with Duration */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {formatDate(arrivalDate)} - {formatDate(departureDate)}
            </span>
          </div>
          {nights > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {nights} {nights === 1 ? 'night' : 'nights'}
            </span>
          )}
        </div>

        {/* Weather Widget (if available) */}
        {weather && (
          <div className="mb-3 flex items-center justify-between bg-blue-50 p-2 rounded-lg">
            <div className="flex items-center">
              {getWeatherIcon()}
              <span className="text-sm text-gray-700 ml-2">
                {weather.temp}°C, {weather.condition}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {weather.humidity}% humidity
            </span>
          </div>
        )}

        {/* Accommodation with Icon */}
        {accommodationName && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-start">
              <HomeIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {accommodationName}
                </p>
                {accommodationAddress && (
                  <p className="text-xs text-gray-500 truncate">{accommodationAddress}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes with Character Limit */}
        {notes && (
          <div className="mb-4 relative">
            <p className="text-sm text-gray-600 line-clamp-2 hover:line-clamp-none transition-all cursor-help"
               title={notes.length > 100 ? notes : undefined}>
              {notes}
            </p>
            {notes.length > 100 && (
              <span className="text-xs text-primary-600 mt-1 block">
                Hover to read more
              </span>
            )}
          </div>
        )}

        {/* Activities Preview with Icons */}
        {activityCount > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm font-medium text-gray-900">
                  Activities
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {completedActivities} completed
              </span>
            </div>

            {/* Activity Progress Bar */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${(completedActivities / activityCount) * 100}%` }}
              />
            </div>

            {/* Activity Type Icons */}
            <div className="flex flex-wrap gap-1">
              {activities.slice(0, 3).map((activity, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-2 py-1 rounded-full ${
                    activity.completed 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {activity.type === 'SIGHTSEEING' && '👀 '}
                  {activity.type === 'FOOD' && '🍽️ '}
                  {activity.type === 'ADVENTURE' && '🏔️ '}
                  {activity.name.substring(0, 12)}...
                </span>
              ))}
              {activityCount > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  +{activityCount - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link
            to={`/trip/${tripId}/itinerary?destination=${id}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center group"
          >
            <span>View Full Itinerary</span>
            <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Collaborator Avatars (if any) */}
          {destination.collaborators?.length > 0 && (
            <div className="flex -space-x-2">
              {destination.collaborators.slice(0, 3).map((collab, idx) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center"
                  title={collab.name}
                >
                  <UserGroupIcon className="h-3 w-3 text-primary-600" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;