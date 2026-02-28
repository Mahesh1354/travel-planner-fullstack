import React from 'react';
import { 
  PaperAirplaneIcon, 
  BuildingOfficeIcon, 
  TicketIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const BookingSearchTabs = ({ activeTab, onTabChange, counts = {} }) => {
  const tabs = [
    { 
      id: 'flights', 
      label: 'Flights', 
      icon: PaperAirplaneIcon,
      count: counts.flights,
      color: 'blue'
    },
    { 
      id: 'hotels', 
      label: 'Hotels', 
      icon: BuildingOfficeIcon,
      count: counts.hotels,
      color: 'green'
    },
    { 
      id: 'activities', 
      label: 'Activities', 
      icon: TicketIcon,
      count: counts.activities,
      color: 'purple'
    },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-8" aria-label="Booking types">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group relative flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all
                ${isActive
                  ? `border-${tab.color}-600 text-${tab.color}-600 dark:text-${tab.color}-400`
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <Icon className={`h-5 w-5 mr-2 transition-transform group-hover:scale-110 ${
                isActive ? `text-${tab.color}-600` : 'text-gray-400'
              }`} />
              <span>{tab.label}</span>
              
              {/* Count Badge */}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full bg-${tab.color}-100 text-${tab.color}-800 dark:bg-${tab.color}-900/30 dark:text-${tab.color}-400`}>
                  {tab.count}
                </span>
              )}
              
              {/* Active Indicator Dot */}
              {isActive && (
                <span className={`absolute -bottom-[2px] left-0 right-0 h-0.5 bg-${tab.color}-600`}></span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BookingSearchTabs;