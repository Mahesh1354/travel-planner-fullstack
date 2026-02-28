import React from 'react';
import { formatDate } from '../../utils/helpers';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const NotificationList = ({ notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TRIP_INVITE':
        return '✉️';
      case 'BOOKING_CONFIRMATION':
        return '✅';
      case 'PAYMENT_REMINDER':
        return '💰';
      case 'WEATHER_ALERT':
        return '☀️';
      case 'GROUP_ACTIVITY':
        return '👥';
      default:
        return '📌';
    }
  };

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <button
          onClick={onMarkAllAsRead}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Mark all as read
        </button>
      </div>

      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
              !notification.read ? 'bg-primary-50' : ''
            }`}
            onClick={() => onMarkAsRead(notification.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-2xl">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(notification.createdAt, 'MMM dd, h:mm a')}
                </p>
              </div>
              {!notification.read && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationList;