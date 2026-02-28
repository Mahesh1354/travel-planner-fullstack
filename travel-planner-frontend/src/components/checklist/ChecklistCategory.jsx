import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  PencilIcon, 
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentDuplicateIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const ChecklistCategory = ({ 
  category, 
  items, 
  onToggleItem, 
  onAddCustomItem,
  onEditItem,
  onDeleteItem,
  onDuplicateItem,
  showProgress = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getCategoryColor = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
      green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400',
      pink: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
      red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400',
      gray: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
    };
    return colors[color] || colors.gray;
  };

  const getProgressColor = () => {
    if (progress === 100) return 'text-green-500';
    if (progress > 50) return 'text-primary-500';
    return 'text-yellow-500';
  };

  const incompleteItems = items.filter(item => !item.completed);
  const completedItems = items.filter(item => item.completed);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      {/* Category Header */}
      <div className={`px-6 py-4 border-b ${getCategoryColor(category.color)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <span className="text-3xl mr-3 drop-shadow">{category.icon}</span>
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                {category.description && (
                  <span className="ml-2 text-xs opacity-75 hidden sm:inline">
                    {category.description}
                  </span>
                )}
              </div>
              <p className="text-sm opacity-75 flex items-center">
                <span>{completedCount} of {totalCount} items</span>
                {totalCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white/30 dark:bg-gray-900/30 rounded-full text-xs">
                    {Math.round(progress)}%
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Progress Circle & Expand Toggle */}
          <div className="flex items-center space-x-4">
            {showProgress && totalCount > 0 && (
              <div className="relative w-12 h-12 hidden sm:block">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={2 * Math.PI * 20 * (1 - progress / 100)}
                    className={`transition-all duration-500 ${getProgressColor()}`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/30 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {isExpanded && totalCount > 0 && (
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                {completedCount} completed
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                {incompleteItems.length} remaining
              </span>
            </div>
            
            {completedItems.length > 0 && (
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="text-primary-600 dark:text-primary-400 hover:underline flex items-center"
              >
                {showCompleted ? 'Hide' : 'Show'} completed
              </button>
            )}
          </div>
        )}
      </div>

      {/* Items List */}
      {isExpanded && (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {/* Incomplete Items */}
          {incompleteItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <button
                onClick={() => onToggleItem(item.id, !item.completed)}
                className="flex-shrink-0 mr-3"
              >
                {item.completed ? (
                  <CheckCircleSolid className="h-5 w-5 text-green-500" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5 text-gray-400 hover:text-primary-500 dark:text-gray-500 dark:hover:text-primary-400 transition-colors" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                  {item.isRequired && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                      Required
                    </span>
                  )}
                  {item.isCustom && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                      Custom
                    </span>
                  )}
                </div>
                
                {item.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                    📝 {item.notes}
                  </p>
                )}
              </div>
              
              {/* Quantity & Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {item.quantity > 1 && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                    x{item.quantity}
                  </span>
                )}
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                  {item.isCustom && (
                    <>
                      <button
                        onClick={() => onEditItem?.(item)}
                        className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Edit item"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDuplicateItem?.(item)}
                        className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Duplicate item"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteItem?.(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Delete item"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Completed Items (if enabled) */}
          {showCompleted && completedItems.length > 0 && (
            <>
              <div className="px-6 py-2 bg-gray-50 dark:bg-gray-700/50">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Completed ({completedItems.length})
                </span>
              </div>
              
              {completedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group opacity-75"
                >
                  <button
                    onClick={() => onToggleItem(item.id, !item.completed)}
                    className="flex-shrink-0 mr-3"
                  >
                    <CheckCircleSolid className="h-5 w-5 text-green-500" />
                  </button>
                  
                  <span className="flex-1 text-sm text-gray-400 dark:text-gray-500 line-through">
                    {item.name}
                  </span>
                  
                  {item.quantity > 1 && (
                    <span className="text-xs text-gray-400 dark:text-gray-600 ml-4">
                      x{item.quantity}
                    </span>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Empty State */}
          {totalCount === 0 && (
            <div className="px-6 py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                No items in this category yet
              </p>
            </div>
          )}
          
          {/* Add Custom Item Button */}
          <button
            onClick={() => onAddCustomItem(category.id)}
            className="w-full px-6 py-4 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors flex items-center justify-center border-t border-gray-100 dark:border-gray-700"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Add custom item
          </button>
        </div>
      )}
    </div>
  );
};

export default ChecklistCategory;