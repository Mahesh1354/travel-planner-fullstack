import React from 'react';
import { Link } from 'react-router-dom';
import { MapIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <MapIcon className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          404 - Page Not Found
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 text-center">
          <Link to="/" className="btn-primary">
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;