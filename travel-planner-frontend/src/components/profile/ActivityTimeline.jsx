import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import { 
  MapPinIcon, 
  CheckCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

const ActivityTimeline = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'trip_created':
        return '🎉';
      case 'destination_added':
        return '📍';
      case 'activity_planned':
        return '📅';
      case 'booking_made':
        return '✈️';
      case 'expense_added':
        return '💰';
      case 'photo_added':
        return '📸';
      default:
        return '📌';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {index !== activities.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                
                <div className="relative flex space-x-3">
                  <div className="flex items-center">
                    <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-lg">
                      {getActivityIcon(activity.type)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900">
                        {activity.description}
                      </span>
                    </div>
                    
                    {activity.tripName && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <Link
                          to={`/trip/${activity.tripId}`}
                          className="hover:text-primary-600"
                        >
                          {activity.tripName}
                        </Link>
                      </div>
                    )}
                    
                    <div className="mt-1 flex items-center text-xs text-gray-400">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {formatDate(activity.createdAt, 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                  
                  {activity.completed && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActivityTimeline;