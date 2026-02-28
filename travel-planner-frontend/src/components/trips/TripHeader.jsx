import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ClockIcon,
  HeartIcon,
  FlagIcon,
  ChevronDownIcon,
  LinkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import toast from 'react-hot-toast';

const TripHeader = ({ trip, onDelete, onDuplicate, onShare, onToggleFavorite }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(trip?.isFavorite || false);
  const [imageError, setImageError] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // Add safety check for trip object
  if (!trip) {
    return null;
  }

  // Add default values to prevent undefined errors
  const {
    id,
    title = 'Untitled Trip',
    description = '',
    destination = '',
    startDate,
    endDate,
    coverImage,
    status = 'PLANNING',
    isPublic = false,
    collaborators = [],
    images = [],
    highlights = [],
  } = trip;

  // Ensure collaborators is an array
  const collaboratorsList = Array.isArray(collaborators) ? collaborators : [];

  const duration = endDate && startDate 
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const handleFavoriteClick = () => {
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    if (onToggleFavorite) {
      onToggleFavorite(id, newValue);
    }
    toast.success(newValue ? 'Added to favorites' : 'Removed from favorites');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleShare = (method) => {
    if (method === 'email') {
      window.location.href = `mailto:?subject=${title}&body=Check out this trip: ${window.location.href}`;
    } else if (method === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${title}&url=${window.location.href}`);
    }
    setShowShareMenu(false);
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'PLANNING': return '📝';
      case 'UPCOMING': return '🔜';
      case 'ONGOING': return '🚀';
      case 'COMPLETED': return '✅';
      case 'CANCELLED': return '❌';
      default: return '📌';
    }
  };

  // Get best available image
  const getImageUrl = () => {
    if (!imageError) {
      return coverImage || images[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format';
    }
    return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format';
  };

  return (
    <div className="relative mb-8">
      {/* Cover Image with Parallax Effect */}
      <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
        <img
          src={getImageUrl()}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button with Glass Effect */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-all z-10 border border-white/30"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="h-5 w-5 text-white" />
        </button>

        {/* Action Buttons with Glass Effect */}
        <div className="absolute top-6 right-6 flex space-x-2 z-10">
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-all border border-white/30"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-white" />
            )}
          </button>

          {/* Share Menu */}
          <Menu as="div" className="relative">
            <Menu.Button 
              className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-all border border-white/30"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <ShareIcon className="h-5 w-5 text-white" />
            </Menu.Button>
            
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Share via</div>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onShare?.(id)}
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } block w-full text-left px-4 py-2.5 text-sm text-gray-700 flex items-center`}
                    >
                      <UserGroupIcon className="h-4 w-4 mr-3 text-gray-500" />
                      Invite people
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleCopyLink}
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } block w-full text-left px-4 py-2.5 text-sm text-gray-700 flex items-center`}
                    >
                      <LinkIcon className="h-4 w-4 mr-3 text-gray-500" />
                      Copy link
                    </button>
                  )}
                </Menu.Item>
                <div className="border-t border-gray-100 my-1"></div>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleShare('email')}
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } block w-full text-left px-4 py-2.5 text-sm text-gray-700 flex items-center`}
                    >
                      <span className="mr-3">📧</span>
                      Email
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleShare('twitter')}
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } block w-full text-left px-4 py-2.5 text-sm text-gray-700 flex items-center`}
                    >
                      <span className="mr-3">🐦</span>
                      Twitter
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Edit Button */}
          <Link
            to={`/edit-trip/${id}`}
            className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-all border border-white/30"
          >
            <PencilIcon className="h-5 w-5 text-white" />
          </Link>

          {/* Duplicate Button */}
          <button
            onClick={() => onDuplicate(id)}
            className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-all border border-white/30"
          >
            <DocumentDuplicateIcon className="h-5 w-5 text-white" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(id)}
            className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-all border border-white/30"
          >
            <TrashIcon className="h-5 w-5 text-red-300 hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Trip Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          {/* Status Badges */}
          <div className="flex items-center space-x-3 mb-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm flex items-center ${getStatusColor(status)}`}>
              <span className="mr-1">{getStatusIcon()}</span>
              {status}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm flex items-center ${
              isPublic ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'
            }`}>
              <GlobeAltIcon className="h-4 w-4 mr-1" />
              {isPublic ? 'Public' : 'Private'}
            </span>
            {duration > 0 && (
              <span className="px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm bg-blue-500/80 text-white flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {duration} days
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">{title}</h1>
          
          {destination && (
            <p className="text-xl mb-4 flex items-center drop-shadow-md">
              <MapPinIcon className="h-6 w-6 mr-2" />
              {destination}
            </p>
          )}

          <div className="flex flex-wrap gap-6 text-sm">
            {startDate && (
              <span className="flex items-center bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {formatDate(startDate)} - {formatDate(endDate)}
              </span>
            )}
            
            <span className="flex items-center bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <UserGroupIcon className="h-4 w-4 mr-2" />
              {collaboratorsList.length + 1} traveler{collaboratorsList.length > 0 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Description and Highlights */}
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        {/* Description */}
        {description && (
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="bg-primary-100 p-2 rounded-lg mr-3">
                <PencilIcon className="h-4 w-4 text-primary-600" />
              </span>
              About this trip
            </h2>
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </div>
        )}

        {/* Highlights */}
        {highlights && highlights.length > 0 && (
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 shadow-sm border border-primary-200">
            <h2 className="text-lg font-semibold text-primary-900 mb-3 flex items-center">
              <FlagIcon className="h-5 w-5 mr-2 text-primary-600" />
              Trip Highlights
            </h2>
            <ul className="space-y-2">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-start text-sm text-primary-800">
                  <span className="text-primary-500 mr-2">✨</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Photo Gallery Preview (if multiple images) */}
      {images && images.length > 1 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <PhotoIcon className="h-5 w-5 mr-2 text-gray-500" />
            Gallery ({images.length})
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {images.slice(0, 4).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${title} ${index + 1}`}
                className="h-24 w-full object-cover rounded-lg hover:opacity-90 cursor-pointer transition-opacity"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripHeader;