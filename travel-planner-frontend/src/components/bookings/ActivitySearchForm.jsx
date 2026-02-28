import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  TagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ActivitySearchForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    location: '',
    date: new Date(),
    participants: 2,
    category: 'all',
    minPrice: '',
    maxPrice: '',
    minRating: 0,
    duration: 'any',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentActivitySearches');
    return saved ? JSON.parse(saved) : [];
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const searchData = {
      location: formData.location,
      date: formData.date.toISOString().split('T')[0],
      participants: formData.participants,
      minPrice: formData.minPrice ? Number(formData.minPrice) : undefined,
      maxPrice: formData.maxPrice ? Number(formData.maxPrice) : undefined,
      minRating: formData.minRating,
    };
    
    if (formData.category !== 'all') {
      searchData.types = [formData.category];
    }

    if (formData.duration !== 'any') {
      searchData.duration = formData.duration;
    }

    // Save to recent searches
    const newRecent = [searchData, ...recentSearches.slice(0, 4)];
    setRecentSearches(newRecent);
    localStorage.setItem('recentActivitySearches', JSON.stringify(newRecent));

    onSearch(searchData);
  };

  const categories = [
    { value: 'all', label: 'All Activities', icon: '🎯' },
    { value: 'SIGHTSEEING', label: 'Sightseeing', icon: '👀' },
    { value: 'ADVENTURE', label: 'Adventure', icon: '🏔️' },
    { value: 'CULTURAL', label: 'Cultural', icon: '🏛️' },
    { value: 'FOOD', label: 'Food & Drink', icon: '🍽️' },
    { value: 'SHOPPING', label: 'Shopping', icon: '🛍️' },
    { value: 'NIGHTLIFE', label: 'Nightlife', icon: '🌃' },
    { value: 'RELAXATION', label: 'Relaxation', icon: '🧘' },
  ];

  const durationOptions = [
    { value: 'any', label: 'Any duration' },
    { value: '1', label: '1 hour or less' },
    { value: '2', label: '2-3 hours' },
    { value: '4', label: '4-6 hours' },
    { value: '7', label: 'Full day (7+ hours)' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recent Searches
          </label>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    location: search.location,
                    participants: search.participants,
                  }));
                }}
                className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <SparklesIcon className="h-3 w-3 mr-1 text-primary-500" />
                {search.location} • {search.participants} {search.participants === 1 ? 'person' : 'people'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City or region"
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
            required
          />
        </div>
      </div>

      {/* Date and Participants */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors z-10" />
            <DatePicker
              id="date"
              selected={formData.date}
              onChange={(date) => setFormData(prev => ({ ...prev, date }))}
              minDate={new Date()}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
              dateFormat="MMMM d, yyyy"
              required
            />
          </div>
        </div>

        {/* Participants */}
        <div>
          <label htmlFor="participants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Number of Participants <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <select
              id="participants"
              name="participants"
              value={formData.participants}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none bg-white dark:bg-gray-800 dark:text-white"
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Person' : 'People'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
              className={`p-3 border-2 rounded-xl text-center transition-all ${
                formData.category === cat.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-200'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-2xl mb-1 block">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        type="button"
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

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl animate-slide-down">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  name="minPrice"
                  value={formData.minPrice}
                  onChange={handleChange}
                  placeholder="Min price"
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
                  min="0"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="maxPrice"
                  value={formData.maxPrice}
                  onChange={handleChange}
                  placeholder="Max price"
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <StarIcon className="h-4 w-4 mr-1" />
              Minimum Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, minRating: rating }))}
                  className={`flex-1 py-2 border-2 rounded-lg text-center transition-all ${
                    formData.minRating === rating
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-yellow-400">{'★'.repeat(rating)}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{rating}+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              Duration
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:text-white"
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button 
        type="submit" 
        className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-[1.02] shadow-lg"
      >
        Search Activities
      </button>
    </form>
  );
};

export default ActivitySearchForm;