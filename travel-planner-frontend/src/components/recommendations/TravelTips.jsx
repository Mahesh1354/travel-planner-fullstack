import React from 'react';
import {
  InformationCircleIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  LanguageIcon,
  WifiIcon,
  HeartIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const TravelTips = ({ destination, tips }) => {
  const getTipIcon = (type) => {
    const tipType = type?.toLowerCase();
    switch (tipType) {
      case 'visa':
      case 'VISA':
        return <GlobeAltIcon className="h-5 w-5 text-blue-500" />;
      case 'currency':
      case 'CURRENCY':
        return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
      case 'safety':
      case 'SAFETY':
        return <ShieldCheckIcon className="h-5 w-5 text-red-500" />;
      case 'language':
      case 'LANGUAGE':
        return <LanguageIcon className="h-5 w-5 text-purple-500" />;
      case 'health':
      case 'HEALTH':
        return <HeartIcon className="h-5 w-5 text-pink-500" />;
      case 'transport':
      case 'TRANSPORT':
        return <TruckIcon className="h-5 w-5 text-indigo-500" />;
      case 'connectivity':
        return <WifiIcon className="h-5 w-5 text-indigo-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!tips || tips.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
          Travel Tips for {destination}
        </h3>
        <p className="text-gray-500 text-center py-8">
          No travel tips available for this destination yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <InformationCircleIcon className="h-5 w-5 text-primary-500 mr-2" />
        Travel Tips for {destination}
      </h3>
      
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-shrink-0 mr-3">
              {getTipIcon(tip.tipType || tip.type)}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {tip.title}
              </h4>
              <p className="text-sm text-gray-600">
                {tip.description}
              </p>
              {tip.source && (
                <p className="text-xs text-gray-400 mt-1">
                  Source: {tip.source}
                </p>
              )}
              {tip.isGovernmentAdvice && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Official Government Advice
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelTips;