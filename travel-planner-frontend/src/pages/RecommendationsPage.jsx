import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import recommendationsAPI from '../api/recommendations';
import PreferenceForm from '../components/recommendations/PreferenceForm';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import TravelTips from '../components/recommendations/TravelTips';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  SparklesIcon, 
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('Paris, France');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [savedItems, setSavedItems] = useState([]);

  // Destinations list
  const destinations = [
    'Paris, France',
    'Tokyo, Japan',
    'New York, USA',
    'Rome, Italy',
    'Barcelona, Spain',
    'Bangkok, Thailand',
    'Sydney, Australia',
    'Cape Town, South Africa',
    'London, UK',
    'Dubai, UAE',
  ];

  // Category filters
  const categories = [
    { id: 'attractions', label: 'Attractions', icon: '🏛️' },
    { id: 'restaurants', label: 'Restaurants', icon: '🍽️' },
    { id: 'activities', label: 'Activities', icon: '🎯' },
  ];

  // Fetch user preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      try {
        const response = await recommendationsAPI.getPreferences();
        return response.data;
      } catch (error) {
        console.log('No preferences found, using defaults');
        return null;
      }
    },
  });

  // Fetch recommendations from API
  const { data: recommendations, isLoading: recommendationsLoading, refetch } = useQuery({
    queryKey: ['recommendations', selectedDestination, selectedCategories],
    queryFn: async () => {
      try {
        const params = {
          location: selectedDestination,
          limit: 10,
        };
        
        // Add category filter if any selected
        if (selectedCategories.length > 0) {
          params.categories = selectedCategories.map(c => c.toUpperCase());
        }
        
        // Add budget from preferences if available
        if (preferences?.budgetLevel) {
          params.budgetLevel = preferences.budgetLevel;
        }
        
        const response = await recommendationsAPI.getRecommendations(params);
        
        // Transform API response to match component props
        const data = response.data || [];
        
        // Group by category
        return {
          attractions: data.filter(item => item.category === 'SIGHTSEEING' || item.category === 'CULTURAL'),
          restaurants: data.filter(item => item.category === 'FOOD'),
          activities: data.filter(item => item.category === 'ACTIVITIES' || item.category === 'ADVENTURE'),
        };
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        toast.error('Failed to load recommendations. Using sample data.');
        
        // Return empty structure - fallback to empty
        return {
          attractions: [],
          restaurants: [],
          activities: [],
        };
      }
    },
    enabled: !!selectedDestination,
  });

  // Fetch travel tips from API
  const { data: tips, isLoading: tipsLoading } = useQuery({
    queryKey: ['tips', selectedDestination],
    queryFn: async () => {
      try {
        const response = await recommendationsAPI.getTravelTips(selectedDestination);
        return response.data || [];
      } catch (error) {
        console.error('Failed to fetch tips:', error);
        return [];
      }
    },
    enabled: !!selectedDestination,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs) => recommendationsAPI.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      toast.success('Preferences saved successfully!');
      setShowPreferences(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save preferences');
    },
  });

  const handleSavePreferences = (prefs) => {
    updatePreferencesMutation.mutate(prefs);
  };

  const handleSaveItem = (itemId) => {
    if (savedItems.includes(itemId)) {
      setSavedItems(savedItems.filter(id => id !== itemId));
      toast.success('Removed from saved items');
    } else {
      setSavedItems([...savedItems, itemId]);
      toast.success('Added to saved items');
    }
  };

  const handleViewDetails = (itemId) => {
    // Navigate to item details or open modal
    toast.success('Opening details...');
    // In a real app, you might navigate to a details page
    // navigate(`/recommendations/${itemId}`);
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Filter items based on search query
  const filterItems = (items) => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredAttractions = filterItems(recommendations?.attractions || []);
  const filteredRestaurants = filterItems(recommendations?.restaurants || []);
  const filteredActivities = filterItems(recommendations?.activities || []);

  const hasAnyResults = filteredAttractions.length > 0 || 
                        filteredRestaurants.length > 0 || 
                        filteredActivities.length > 0;

  if (preferencesLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <SparklesIcon className="h-8 w-8 text-primary-600 mr-2" />
                Personalized Recommendations
              </h1>
              <p className="text-gray-600 mt-1">
                Discover places, activities, and experiences tailored to your preferences
              </p>
            </div>
            
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="btn-secondary inline-flex items-center self-start"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              {showPreferences ? 'Hide Preferences' : 'Customize Preferences'}
            </button>
          </div>
        </div>

        {/* Preferences Form */}
        {showPreferences && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Your Travel Preferences
            </h2>
            <PreferenceForm
              onSave={handleSavePreferences}
              initialPreferences={preferences}
            />
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Destination Selector */}
            <div className="flex-1 flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="flex-1 input-field"
              >
                {destinations.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 input-field"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategories.includes(category.id)
                    ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations Grid */}
        {recommendationsLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : !hasAnyResults ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <SparklesIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Recommendations Found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your filters, changing the destination, or updating your preferences.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Attractions */}
            {filteredAttractions.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🏛️</span> Popular Attractions
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredAttractions.length})
                  </span>
                </h2>
                <div className="space-y-4">
                  {filteredAttractions.map(item => (
                    <RecommendationCard
                      key={item.id}
                      item={{
                        ...item,
                        type: 'attraction',
                        saved: savedItems.includes(item.id)
                      }}
                      onSave={handleSaveItem}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Restaurants */}
            {filteredRestaurants.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🍽️</span> Recommended Restaurants
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredRestaurants.length})
                  </span>
                </h2>
                <div className="space-y-4">
                  {filteredRestaurants.map(item => (
                    <RecommendationCard
                      key={item.id}
                      item={{
                        ...item,
                        type: 'restaurant',
                        saved: savedItems.includes(item.id)
                      }}
                      onSave={handleSaveItem}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Activities */}
            {filteredActivities.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🎯</span> Top Activities
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredActivities.length})
                  </span>
                </h2>
                <div className="space-y-4">
                  {filteredActivities.map(item => (
                    <RecommendationCard
                      key={item.id}
                      item={{
                        ...item,
                        type: 'activity',
                        saved: savedItems.includes(item.id)
                      }}
                      onSave={handleSaveItem}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Travel Tips */}
        <div className="mt-8">
          <TravelTips
            destination={selectedDestination}
            tips={tipsLoading ? [] : (tips || [])}
          />
        </div>

        {/* Saved Items Summary */}
        {savedItems.length > 0 && (
          <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-lg p-4 border border-gray-200 animate-fade-in">
            <p className="text-sm text-gray-600">
              You have <span className="font-semibold text-primary-600">{savedItems.length}</span> saved {savedItems.length === 1 ? 'item' : 'items'}
            </p>
            <button 
              onClick={() => toast.success('Saved items view coming soon!')}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              View Saved
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;