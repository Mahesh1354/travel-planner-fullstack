import React from 'react';
import { Toaster, toast as hotToast } from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

// Custom toast styles
const toastStyles = {
  success: {
    icon: '✅',
    iconElement: <CheckCircleSolid className="h-5 w-5 text-green-500" />,
    style: {
      background: '#10b981',
      color: 'white',
    },
  },
  error: {
    icon: '❌',
    iconElement: <XCircleIcon className="h-5 w-5 text-red-500" />,
    style: {
      background: '#ef4444',
      color: 'white',
    },
  },
  info: {
    icon: 'ℹ️',
    iconElement: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
    style: {
      background: '#3b82f6',
      color: 'white',
    },
  },
  warning: {
    icon: '⚠️',
    iconElement: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
    style: {
      background: '#f59e0b',
      color: 'white',
    },
  },
  loading: {
    icon: '⏳',
    iconElement: <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />,
    style: {
      background: '#3b82f6',
      color: 'white',
    },
  },
  achievement: {
    icon: '🏆',
    iconElement: <SparklesIcon className="h-5 w-5 text-yellow-400" />,
    style: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
      color: 'white',
    },
    duration: 5000,
  },
};

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        // Success toast
        success: {
          icon: '✅',
          iconTheme: {
            primary: '#10b981',
            secondary: 'white',
          },
          style: {
            background: '#10b981',
            color: 'white',
          },
        },
        // Error toast
        error: {
          icon: '❌',
          iconTheme: {
            primary: '#ef4444',
            secondary: 'white',
          },
          style: {
            background: '#ef4444',
            color: 'white',
          },
        },
        // Loading toast
        loading: {
          icon: '⏳',
          style: {
            background: '#3b82f6',
            color: 'white',
          },
        },
      }}
    >
      {/* Custom toast renderer */}
      {(t) => (
        <div
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {t.type === 'success' && <CheckCircleSolid className="h-6 w-6 text-green-500" />}
                {t.type === 'error' && <XCircleIcon className="h-6 w-6 text-red-500" />}
                {t.type === 'info' && <InformationCircleIcon className="h-6 w-6 text-blue-500" />}
                {t.type === 'warning' && <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {t.title || t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {t.message || t.content}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => hotToast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Toaster>
  );
};

// Custom toast helpers
export const customToast = {
  success: (message, options = {}) => hotToast.success(message, options),
  error: (message, options = {}) => hotToast.error(message, options),
  info: (message, options = {}) => hotToast(message, { 
    ...options, 
    icon: 'ℹ️',
    style: { background: '#3b82f6', color: 'white' }
  }),
  warning: (message, options = {}) => hotToast(message, { 
    ...options, 
    icon: '⚠️',
    style: { background: '#f59e0b', color: 'white' }
  }),
  loading: (message, options = {}) => hotToast.loading(message, options),
  achievement: (message, options = {}) => hotToast(message, { 
    ...options, 
    icon: '🏆',
    duration: 5000,
    style: { background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', color: 'white' }
  }),
  promise: (promise, messages, options = {}) => hotToast.promise(promise, messages, options),
  dismiss: (toastId) => hotToast.dismiss(toastId),
  dismissAll: () => hotToast.dismiss(),
};

export default Toast;