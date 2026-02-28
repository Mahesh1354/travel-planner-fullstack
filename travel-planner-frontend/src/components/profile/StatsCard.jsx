import React from 'react';
import { 
  MapIcon, 
  GlobeAltIcon, 
  CalendarIcon,
  CurrencyDollarIcon,
  CameraIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';

const StatsCard = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Trips',
      value: stats.totalTrips,
      icon: MapIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Countries Visited',
      value: stats.countriesVisited,
      icon: GlobeAltIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Days Traveled',
      value: stats.totalDays,
      icon: CalendarIcon,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Total Spent',
      value: stats.totalSpent,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      format: (val) => `$${val.toLocaleString()}`,
    },
    {
      label: 'Photos',
      value: stats.totalPhotos,
      icon: CameraIcon,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
    {
      label: 'Saved Places',
      value: stats.savedPlaces,
      icon: HeartIcon,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

  const formatValue = (stat, value) => {
    if (stat.format) {
      return stat.format(value);
    }
    return value;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {formatValue(stat, stat.value)}
            </span>
          </div>
          <p className="text-sm text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCard;