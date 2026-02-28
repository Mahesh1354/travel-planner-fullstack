import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  CalendarIcon,
  TagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const TripFilters = ({ 
  searchQuery, 
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
  onClearAll,
  additionalFilters = {},
  onAdditionalFilterChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Trips', icon: '🌍' },
    { value: 'PLANNING', label: 'Planning', icon: '📝', color: 'bg-blue-100 text-blue-800' },
    { value: 'UPCOMING', label: 'Upcoming', icon: '🔜', color: 'bg-green-100 text-green-800' },
    { value: 'ONGOING', label: 'Ongoing', icon: '🚀', color: 'bg-purple-100 text-purple-800' },
    { value: 'COMPLETED', label: 'Completed', icon: '✅', color: 'bg-gray-100 text-gray-800' },
    { value: 'CANCELLED', label: 'Cancelled', icon: '❌', color: 'bg-red-100 text-red-800' },
  ];

  const dateOptions = [
    { value: 'all', label: 'All Dates', icon: '📅' },
    { value: 'upcoming', label: 'Upcoming', icon: '🔜' },
    { value: 'past', label: 'Past', icon: '📆' },
    { value: 'this-week', label: 'This Week', icon: '📅' },
    { value: 'this-month', label: 'This Month', icon: '📅' },
    { value: 'next-month', label: 'Next Month', icon: '📅' },
    { value: 'custom', label: 'Custom Range', icon: '✏️' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: '⬇️' },
    { value: 'oldest', label: 'Oldest First', icon: '⬆️' },
    { value: 'name-asc', label: 'Name (A-Z)', icon: '🔤' },
    { value: 'name-desc', label: 'Name (Z-A)', icon: '🔤' },
    { value: 'duration', label: 'Longest First', icon: '⏱️' },
    { value: 'duration-asc', label: 'Shortest First', icon: '⏱️' },
    { value: 'budget-high', label: 'Budget: High to Low', icon: '💰' },
    { value: 'budget-low', label: 'Budget: Low to High', icon: '💰' },
  ];

  const durationOptions = [
    { value: 'all', label: 'Any duration' },
    { value: '1-3', label: '1-3 days' },
    { value: '4-7', label: '4-7 days' },
    { value: '8-14', label: '1-2 weeks' },
    { value: '15-30', label: '2-4 weeks' },
    { value: '30+', label: '1 month+' },
  ];

  const getActiveFilterCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (dateFilter !== 'all') count++;
    if (sortBy !== 'newest') count++;
    if (additionalFilters.duration && additionalFilters.duration !== 'all') count++;
    if (additionalFilters.minBudget) count++;
    if (additionalFilters.maxBudget) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Search Bar - Always visible */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trips by name, destination, or description..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onToggleFilters}
              className={`px-4 py-2.5 rounded-lg border transition-all flex items-center justify-center min-w-[100px] ${
                showFilters 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
              }`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
            
            {activeFilterCount > 0 && (
              <button
                onClick={onClearAll}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 animate-slide-down">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter - Enhanced */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                <TagIcon className="h-4 w-4 inline mr-1" />
                Trip Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter - Enhanced */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                {dateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By - Enhanced */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                {sortBy.includes('asc') ? <ArrowUpIcon className="h-4 w-4 inline mr-1" /> : <ArrowDownIcon className="h-4 w-4 inline mr-1" />}
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Filter - New */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                ⏱️ Trip Length
              </label>
              <select
                value={additionalFilters.duration || 'all'}
                onChange={(e) => onAdditionalFilterChange?.('duration', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="mt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showAdvanced ? (
                <>
                  <ChevronUpIcon className="h-4 w-4 mr-1" />
                  Hide advanced filters
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-4 w-4 mr-1" />
                  Show advanced filters
                </>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid md:grid-cols-2 gap-4 animate-slide-down">
              {/* Budget Range */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  💰 Budget Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={additionalFilters.minBudget || ''}
                    onChange={(e) => onAdditionalFilterChange?.('minBudget', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={additionalFilters.maxBudget || ''}
                    onChange={(e) => onAdditionalFilterChange?.('maxBudget', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Travelers Count */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  👥 Travelers
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Number of travelers"
                  value={additionalFilters.travelers || ''}
                  onChange={(e) => onAdditionalFilterChange?.('travelers', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Tags/Keywords */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  🏷️ Tags
                </label>
                <input
                  type="text"
                  placeholder="e.g., beach, adventure, family, romantic"
                  value={additionalFilters.tags || ''}
                  onChange={(e) => onAdditionalFilterChange?.('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display - Enhanced */}
      {activeFilterCount > 0 && (
        <div className="p-3 bg-primary-50 border-t border-primary-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-primary-700 mr-2">Active filters:</span>
          
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
              {statusOptions.find(o => o.value === statusFilter)?.icon} Status: {statusOptions.find(o => o.value === statusFilter)?.label}
              <button
                onClick={() => onStatusChange('all')}
                className="ml-2 hover:text-primary-900"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {dateFilter !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
              {dateOptions.find(o => o.value === dateFilter)?.icon} {dateOptions.find(o => o.value === dateFilter)?.label}
              <button
                onClick={() => onDateChange('all')}
                className="ml-2 hover:text-primary-900"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {sortBy !== 'newest' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
              {sortOptions.find(o => o.value === sortBy)?.icon} {sortOptions.find(o => o.value === sortBy)?.label}
              <button
                onClick={() => onSortChange('newest')}
                className="ml-2 hover:text-primary-900"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}

          {additionalFilters.duration && additionalFilters.duration !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
              ⏱️ {durationOptions.find(o => o.value === additionalFilters.duration)?.label}
              <button
                onClick={() => onAdditionalFilterChange?.('duration', 'all')}
                className="ml-2 hover:text-primary-900"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}

          {additionalFilters.minBudget && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
              💰 Min: ${additionalFilters.minBudget}
              <button
                onClick={() => onAdditionalFilterChange?.('minBudget', '')}
                className="ml-2 hover:text-primary-900"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}

          {additionalFilters.maxBudget && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
              💰 Max: ${additionalFilters.maxBudget}
              <button
                onClick={() => onAdditionalFilterChange?.('maxBudget', '')}
                className="ml-2 hover:text-primary-900"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      
    </div>
  );
};

export default TripFilters;