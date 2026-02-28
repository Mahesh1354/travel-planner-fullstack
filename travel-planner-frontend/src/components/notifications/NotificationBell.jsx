import React, { Fragment, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate } from '../../utils/helpers';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Navigate based on notification type
    // You can add logic here to redirect to relevant page
  };

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

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 mt-2 w-80 sm:w-96 z-50">
              <div className="bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.slice(0, 10).map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-primary-50' : ''
                          }`}
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
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <Link
                      to="/notifications"
                      className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default NotificationBell;