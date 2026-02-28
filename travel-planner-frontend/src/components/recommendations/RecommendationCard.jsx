import React from 'react';
import { 
  StarIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  HeartIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const RecommendationCard = ({ item, onSave, onViewDetails }) => {
  const {
    id,
    name,
    type,
    image,
    location,
    rating,
    reviews,
    price,
    currency = 'USD',
    duration,
    description,
    tags,
    saved = false
  } = item;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'attraction':
        return '🏛️';
      case 'restaurant':
        return '🍽️';
      case 'activity':
        return '🎯';
      case 'hotel':
        return '🏨';
      default:
        return '📍';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-48 h-48 md:h-auto relative">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm">
            <span className="mr-1">{getTypeIcon()}</span>
            <span className="text-xs font-medium text-gray-700">{type}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
              
              {/* Location */}
              <p className="text-sm text-gray-500 flex items-center mb-2">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {location}
              </p>

              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    star <= rating ? (
                      <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <StarIcon key={star} className="h-4 w-4 text-gray-300" />
                    )
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {rating.toFixed(1)} ({reviews} reviews)
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-4 mb-3">
                {price > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    {formatCurrency(price)}
                    {type === 'hotel' && ' per night'}
                    {type === 'activity' && ' per person'}
                  </div>
                )}
                
                {duration && (
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {duration} mins
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {description}
              </p>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => onSave(id)}
                className={`p-2 rounded-full transition-colors ${
                  saved
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
                title={saved ? 'Remove from saved' : 'Save for later'}
              >
                <HeartIcon className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => onViewDetails(id)}
                className="btn-secondary text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;