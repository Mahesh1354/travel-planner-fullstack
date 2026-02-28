import React, { useState } from "react";
import {
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ChevronUpDownIcon,
  DocumentTextIcon,
  TagIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { formatDateTime, getActivityTypeColor } from "../../utils/helpers";
import { ACTIVITY_TYPES } from "../../utils/constants";

const ActivityCard = ({
  activity,
  onEdit,
  onDelete,
  onToggleComplete,
  dragHandleProps,
  showTime = true,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const {
    id,
    name,
    type,
    startTime,
    endTime,
    location,
    cost,
    currency = "USD",
    notes,
    completed,
    bookingReference,
    image,
    rating,
    duration,
  } = activity;

  // Debug log
  console.log("ActivityCard rendering:", { id, name, completed });

  const activityType = ACTIVITY_TYPES.find((t) => t.value === type) || {
    icon: "📌",
    label: type,
    color: "gray",
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
  };

  const getTimeStatus = () => {
    if (!startTime) return null;
    
    const now = new Date();
    const [hours, minutes] = startTime.split(':');
    const activityTime = new Date();
    activityTime.setHours(parseInt(hours), parseInt(minutes));
    
    const diffMinutes = Math.floor((activityTime - now) / (1000 * 60));
    
    if (diffMinutes < 0) return 'past';
    if (diffMinutes < 60) return 'soon';
    if (diffMinutes < 180) return 'upcoming';
    return 'later';
  };

  const timeStatus = getTimeStatus();
  const timeStatusColors = {
    soon: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
    past: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  // Compact view for summaries
  if (compact) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center min-w-0">
          <span className="text-lg mr-2">{activityType.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
            {startTime && (
              <p className="text-xs text-gray-500">{startTime}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {cost > 0 && (
            <span className="text-xs font-medium text-gray-700">
              {formatCurrency(cost)}
            </span>
          )}
          <button
            onClick={() => onToggleComplete(id, !completed)}
            className={`p-1 rounded-full transition-colors ${
              completed ? 'text-green-600' : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <CheckCircleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative bg-white border rounded-xl hover:shadow-lg transition-all duration-300 ${
        completed 
          ? 'border-green-200 bg-gradient-to-r from-green-50/30 to-white' 
          : timeStatus === 'soon'
          ? 'border-yellow-200 bg-gradient-to-r from-yellow-50/30 to-white'
          : 'border-gray-200'
      } ${expanded ? 'shadow-md' : ''}`}
    >
      {/* Drag Handle */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
        </div>
      )}

      <div className={`p-4 ${dragHandleProps ? "pl-10" : ""}`}>
        {/* Main Content */}
        <div className="flex items-start">
          {/* Activity Icon with Status Ring */}
          <div className="relative">
            <div
              className={`shrink-0 w-12 h-12 rounded-xl bg-${activityType.color}-100 flex items-center justify-center mr-4 ${
                completed ? 'opacity-75' : ''
              }`}
            >
              <span className="text-2xl">{activityType.icon}</span>
            </div>
            {timeStatus === 'soon' && !completed && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
            )}
          </div>

          {/* Activity Details */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-semibold text-gray-900 flex items-center">
                    {name}
                    {completed && (
                      <CheckCircleSolid className="h-4 w-4 text-green-500 ml-2" />
                    )}
                  </h4>
                  
                  {/* Type Badge */}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${activityType.color}-100 text-${activityType.color}-800`}>
                    {activityType.label}
                  </span>

                  {/* Time Status Badge */}
                  {timeStatus && !completed && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      timeStatusColors[timeStatus] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {timeStatus === 'soon' && '🔜 Starting soon'}
                      {timeStatus === 'upcoming' && '⏳ Upcoming'}
                      {timeStatus === 'past' && '📅 Past'}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons - Desktop */}
              <div className="hidden md:flex items-center space-x-1 ml-4">
                <button
                  onClick={() => onToggleComplete(id, !completed)}
                  className={`p-2 rounded-lg transition-all ${
                    completed
                      ? 'text-green-600 bg-green-50 hover:bg-green-100'
                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  }`}
                  title={completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  <CheckCircleIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onEdit(activity)}
                  className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                  title="Edit activity"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Delete activity"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all lg:hidden"
                >
                  {expanded ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Mobile Actions Button */}
              <div className="md:hidden relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
                
                {showActions && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => {
                        onToggleComplete(id, !completed);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                      {completed ? 'Mark incomplete' : 'Mark complete'}
                    </button>
                    <button
                      onClick={() => {
                        onEdit(activity);
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

            {/* Time Row */}
            {(startTime || endTime || duration) && (
              <div className="flex items-center text-sm text-gray-600 mt-2 flex-wrap gap-x-4 gap-y-1">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1 shrink-0 text-gray-400" />
                  <span>
                    {startTime || 'Flexible'}
                    {endTime && ` - ${endTime}`}
                  </span>
                </div>
                {duration && (
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {formatDuration(duration)}
                  </span>
                )}
              </div>
            )}

            {/* Location */}
            {location && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPinIcon className="h-4 w-4 mr-1 shrink-0 text-gray-400" />
                <span className="truncate">{location}</span>
                {location.includes(',') && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary-600 hover:text-primary-700 text-xs"
                  >
                    View on map
                  </a>
                )}
              </div>
            )}

            {/* Cost & Booking Row */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2">
              {cost > 0 && (
                <div className="flex items-center text-sm">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="font-medium text-gray-900">{formatCurrency(cost)}</span>
                </div>
              )}

              {bookingReference && (
                <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  <LinkIcon className="h-3 w-3 mr-1" />
                  Ref: {bookingReference}
                </div>
              )}

              {rating && (
                <div className="flex items-center text-xs text-yellow-600">
                  <span className="text-yellow-400 mr-1">★</span>
                  {rating}
                </div>
              )}
            </div>

            {/* Expandable Details */}
            {(notes || image) && (
              <>
                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center text-xs text-primary-600 hover:text-primary-700 mt-3 transition-colors"
                >
                  <span>{expanded ? 'Show less' : 'Show more details'}</span>
                  {expanded ? (
                    <ChevronUpIcon className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronDownIcon className="h-3 w-3 ml-1" />
                  )}
                </button>

                {/* Expanded Content */}
                {expanded && (
                  <div className="mt-3 space-y-3 animate-slide-down">
                    {image && (
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-32 object-cover rounded-lg"
                        loading="lazy"
                      />
                    )}
                    
                    {notes && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start">
                          <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ActivityCard;