import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const PreDepartureChecklist = ({ items, onToggleItem, onViewAll }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Group items by category (if they have one)
  const essentialItems = items.filter(item => item.isRequired);
  const regularItems = items.filter(item => !item.isRequired && !item.isCustom);
  const customItems = items.filter(item => item.isCustom);

  const getProgressColor = () => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 50) return 'bg-primary-500';
    if (progress > 0) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getUrgentItems = () => {
    return items.filter(item => !item.completed && item.isRequired).length;
  };

  const urgentCount = getUrgentItems();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-lg mr-4">
              <DocumentCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold flex items-center">
                Pre-Departure Checklist
                {urgentCount > 0 && (
                  <span className="ml-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                    {urgentCount} urgent
                  </span>
                )}
              </h3>
              <p className="text-sm text-primary-100">
                {completedCount} of {totalCount} tasks completed
              </p>
            </div>
          </div>
          
          {/* Progress Circle */}
          <div className="relative w-16 h-16 hidden sm:block">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-white/30"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={2 * Math.PI * 28 * (1 - progress / 100)}
                className="text-white transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Mobile Progress Bar */}
          <div className="sm:hidden w-24 h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-2xl font-bold">{essentialItems.length}</p>
            <p className="text-xs opacity-90">Essential</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-2xl font-bold">{regularItems.length}</p>
            <p className="text-xs opacity-90">Regular</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <p className="text-2xl font-bold">{customItems.length}</p>
            <p className="text-xs opacity-90">Custom</p>
          </div>
        </div>

        {/* Expand Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 w-full flex items-center justify-center text-sm text-white/80 hover:text-white transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="h-4 w-4 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDownIcon className="h-4 w-4 mr-1" />
              Show checklist
            </>
          )}
        </button>
      </div>

      {/* Items List */}
      {isExpanded && (
        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
          {/* Urgent Items First */}
          {essentialItems.filter(i => !i.completed).length > 0 && (
            <>
              <div className="px-6 py-2 bg-red-50 dark:bg-red-900/20 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-xs font-medium text-red-700 dark:text-red-400">
                  Urgent - Complete before departure
                </span>
              </div>
              {essentialItems
                .filter(i => !i.completed)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <button
                      onClick={() => onToggleItem(item.id, !item.completed)}
                      className="flex-shrink-0 mr-3"
                    >
                      {item.completed ? (
                        <CheckCircleSolid className="h-5 w-5 text-green-500" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400" />
                      )}
                    </button>
                    
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {item.name}
                      <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                        Required
                      </span>
                    </span>
                    
                    {item.quantity > 1 && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full ml-4">
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                ))}
            </>
          )}

          {/* Regular Items */}
          {regularItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <button
                onClick={() => onToggleItem(item.id, !item.completed)}
                className="flex-shrink-0 mr-3"
              >
                {item.completed ? (
                  <CheckCircleSolid className="h-5 w-5 text-green-500" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5 text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400" />
                )}
              </button>
              
              <span className={`flex-1 text-sm ${
                item.completed 
                  ? 'text-gray-400 dark:text-gray-500 line-through' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {item.name}
              </span>
              
              {item.quantity > 1 && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full ml-4">
                  x{item.quantity}
                </span>
              )}
            </div>
          ))}

          {/* Custom Items */}
          {customItems.length > 0 && (
            <>
              <div className="px-6 py-2 bg-purple-50 dark:bg-purple-900/20 flex items-center">
                <SparklesIcon className="h-4 w-4 text-purple-500 mr-2" />
                <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
                  Custom Items
                </span>
              </div>
              {customItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <button
                    onClick={() => onToggleItem(item.id, !item.completed)}
                    className="flex-shrink-0 mr-3"
                  >
                    {item.completed ? (
                      <CheckCircleSolid className="h-5 w-5 text-green-500" />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5 text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400" />
                    )}
                  </button>
                  
                  <span className={`flex-1 text-sm ${
                    item.completed 
                      ? 'text-gray-400 dark:text-gray-500 line-through' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.name}
                    {item.notes && (
                      <span className="ml-2 text-xs text-gray-400">📝 {item.notes}</span>
                    )}
                  </span>
                  
                  {item.quantity > 1 && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full ml-4">
                      x{item.quantity}
                    </span>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Empty State */}
          {totalCount === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <DocumentCheckIcon className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No checklist items yet
              </p>
              <button
                onClick={onViewAll}
                className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
              >
                Add items from categories
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {totalCount > 0 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onViewAll}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center"
          >
            <SparklesIcon className="h-4 w-4 mr-1" />
            View all checklist categories
          </button>
        </div>
      )}
    </div>
  );
};

export default PreDepartureChecklist;