import React, { useState } from 'react';
import { 
  HeartIcon, 
  CurrencyDollarIcon,
  GlobeAltIcon,
  UserGroupIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const PreferenceForm = ({ onSave, initialPreferences }) => {
  const [preferences, setPreferences] = useState({
    preferredCategories: initialPreferences?.preferredCategories || [],
    budgetLevel: initialPreferences?.budgetLevel || 'MID_RANGE',
    dietaryRestrictions: initialPreferences?.dietaryRestrictions || [],
    interests: initialPreferences?.interests || [],
    accessibilityNeeds: initialPreferences?.accessibilityNeeds || false,
    travelStyle: initialPreferences?.travelStyle || 'BALANCED',
    activityLevel: initialPreferences?.activityLevel || 'MODERATE',
  });

  const categories = [
    { id: 'SIGHTSEEING', label: 'Sightseeing', icon: '🏛️', color: 'blue' },
    { id: 'ADVENTURE', label: 'Adventure', icon: '🏔️', color: 'green' },
    { id: 'CULTURAL', label: 'Cultural', icon: '🎭', color: 'purple' },
    { id: 'FOOD', label: 'Food & Drink', icon: '🍽️', color: 'orange' },
    { id: 'SHOPPING', label: 'Shopping', icon: '🛍️', color: 'pink' },
    { id: 'NIGHTLIFE', label: 'Nightlife', icon: '🌃', color: 'indigo' },
    { id: 'RELAXATION', label: 'Relaxation', icon: '🏖️', color: 'teal' },
    { id: 'NATURE', label: 'Nature', icon: '🌿', color: 'emerald' },
  ];

  const budgetLevels = [
    { id: 'BUDGET', label: 'Budget', description: 'Economy options, hostels, street food', icon: '💰' },
    { id: 'MID_RANGE', label: 'Mid-Range', description: 'Comfortable hotels, casual dining', icon: '💰💰' },
    { id: 'LUXURY', label: 'Luxury', description: 'High-end hotels, fine dining', icon: '💰💰💰' },
  ];

  const travelStyles = [
    { id: 'RELAXED', label: 'Relaxed', description: 'Slow pace, lots of free time' },
    { id: 'BALANCED', label: 'Balanced', description: 'Mix of activities and downtime' },
    { id: 'INTENSIVE', label: 'Intensive', description: 'Packed schedule, see it all' },
  ];

  const activityLevels = [
    { id: 'LOW', label: 'Low', description: 'Minimal walking, mostly seated activities' },
    { id: 'MODERATE', label: 'Moderate', description: 'Some walking, stairs okay' },
    { id: 'HIGH', label: 'High', description: 'Lots of walking, hiking, active pursuits' },
  ];

  const interests = [
    'History', 'Art', 'Architecture', 'Music', 'Photography',
    'Wildlife', 'Beaches', 'Mountains', 'Local Culture', 'Food Markets',
    'Wine Tasting', 'Cooking', 'Yoga', 'Meditation', 'Sports',
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher',
    'Pescatarian', 'Nut Allergy', 'Shellfish Allergy',
  ];

  const handleCategoryToggle = (categoryId) => {
    setPreferences(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(categoryId)
        ? prev.preferredCategories.filter(c => c !== categoryId)
        : [...prev.preferredCategories, categoryId],
    }));
  };

  const handleInterestToggle = (interest) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleDietaryToggle = (diet) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(diet)
        ? prev.dietaryRestrictions.filter(d => d !== diet)
        : [...prev.dietaryRestrictions, diet],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(preferences);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Preferred Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What do you enjoy?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(category => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryToggle(category.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                preferences.preferredCategories.includes(category.id)
                  ? `border-${category.color}-500 bg-${category.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl mb-2 block">{category.icon}</span>
              <span className="text-sm font-medium text-gray-900">
                {category.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Level */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Level</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {budgetLevels.map(budget => (
            <button
              key={budget.id}
              type="button"
              onClick={() => setPreferences(prev => ({ ...prev, budgetLevel: budget.id }))}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                preferences.budgetLevel === budget.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl mb-2 block">{budget.icon}</span>
              <p className="font-medium text-gray-900">{budget.label}</p>
              <p className="text-sm text-gray-500 mt-1">{budget.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Travel Style */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Style</h3>
          <div className="space-y-3">
            {travelStyles.map(style => (
              <label key={style.id} className="flex items-center">
                <input
                  type="radio"
                  name="travelStyle"
                  value={style.id}
                  checked={preferences.travelStyle === style.id}
                  onChange={(e) => setPreferences(prev => ({ ...prev, travelStyle: e.target.value }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    {style.label}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {style.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Level</h3>
          <div className="space-y-3">
            {activityLevels.map(level => (
              <label key={level.id} className="flex items-center">
                <input
                  type="radio"
                  name="activityLevel"
                  value={level.id}
                  checked={preferences.activityLevel === level.id}
                  onChange={(e) => setPreferences(prev => ({ ...prev, activityLevel: e.target.value }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    {level.label}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {level.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Interests */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Interests</h3>
        <div className="flex flex-wrap gap-2">
          {interests.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => handleInterestToggle(interest)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                preferences.interests.includes(interest)
                  ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dietary Restrictions</h3>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map(diet => (
            <button
              key={diet}
              type="button"
              onClick={() => handleDietaryToggle(diet)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                preferences.dietaryRestrictions.includes(diet)
                  ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              {diet}
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility Needs */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="accessibility"
          checked={preferences.accessibilityNeeds}
          onChange={(e) => setPreferences(prev => ({ ...prev, accessibilityNeeds: e.target.checked }))}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="accessibility" className="ml-2 block text-sm text-gray-700">
          I have accessibility needs (wheelchair accessible, mobility assistance, etc.)
        </label>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button type="submit" className="btn-primary w-full">
          Save Preferences
        </button>
      </div>
    </form>
  );
};

export default PreferenceForm;