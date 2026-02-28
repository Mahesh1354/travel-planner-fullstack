import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import tripsAPI from '../api/trips';
import checklistAPI from '../api/checklist';
import { checklistCategories, preDepartureChecklist, getWeatherBasedItems } from '../data/checklistData';
import ChecklistCategory from '../components/checklist/ChecklistCategory';
import PreDepartureChecklist from '../components/checklist/PreDepartureChecklist';
import AddCustomItemModal from '../components/checklist/AddCustomItemModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useWeather } from '../hooks/useWeather';
import toast from 'react-hot-toast';

const ChecklistPage = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [checklistState, setChecklistState] = useState({});

  // Fetch trip details
  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const response = await tripsAPI.getTrip(tripId);
      return response.data;
    },
  });

  // Fetch weather for recommendations
  const { currentWeather } = useWeather(
    trip?.data?.destination?.split(',')[0].trim()
  );

  // Initialize checklist from template
  useEffect(() => {
    if (!tripId) return;

    const initialChecklist = {};
    
    // Initialize categories
    checklistCategories.forEach(category => {
      initialChecklist[category.id] = category.items.map(item => ({
        ...item,
        completed: false,
        tripId,
      }));
    });

    // Add weather-based recommendations
    if (currentWeather) {
      const weatherItems = getWeatherBasedItems(currentWeather.description);
      weatherItems.forEach(item => {
        if (!initialChecklist.misc) initialChecklist.misc = [];
        initialChecklist.misc.push({
          ...item,
          completed: false,
          tripId,
          isRecommended: true,
        });
      });
    }

    setChecklistState(initialChecklist);
  }, [tripId, currentWeather]);

  // Toggle checklist item
  const toggleItem = (categoryId, itemId, completed) => {
    setChecklistState(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].map(item =>
        item.id === itemId ? { ...item, completed } : item
      ),
    }));
    
    // In a real app, you'd call the API here
    // checklistAPI.toggleChecklistItem(tripId, itemId, completed);
    
    toast.success(completed ? 'Item checked!' : 'Item unchecked', {
      icon: completed ? '✅' : '↩️',
    });
  };

  // Add custom item
  const addCustomItem = (itemData) => {
    const newItem = {
      id: `custom-${Date.now()}`,
      ...itemData,
      completed: false,
    };

    setChecklistState(prev => ({
      ...prev,
      [itemData.category]: [...(prev[itemData.category] || []), newItem],
    }));

    toast.success('Custom item added!');
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    let totalItems = 0;
    let completedItems = 0;

    Object.values(checklistState).forEach(category => {
      category.forEach(item => {
        totalItems++;
        if (item.completed) completedItems++;
      });
    });

    return {
      total: totalItems,
      completed: completedItems,
      percentage: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
    };
  };

  const progress = calculateOverallProgress();

  if (tripLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Trip Details
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {trip?.data?.title} - Packing Checklist
          </h1>
          <p className="text-gray-600">
            Make sure you don't forget anything for your trip
          </p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Overall Progress
            </h2>
            <span className="text-sm text-gray-600">
              {progress.completed} of {progress.total} items
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Weather-based Recommendations */}
        {currentWeather && (
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-4 mb-6 border border-blue-200">
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Weather-based recommendations:</span>{' '}
                Based on {currentWeather.description.toLowerCase()} weather in {trip?.data?.destination},
                we've added relevant items to your checklist.
              </p>
            </div>
          </div>
        )}

        {/* Pre-Departure Checklist */}
        <div className="mb-6">
          <PreDepartureChecklist
            items={preDepartureChecklist.map(item => ({
              ...item,
              completed: false, // In a real app, this would come from API
            }))}
            onToggleItem={(id, completed) => {
              toast.success(completed ? 'Task completed!' : 'Task pending');
            }}
          />
        </div>

        {/* Category Checklists */}
        <div className="space-y-6">
          {checklistCategories.map((category) => (
            <ChecklistCategory
              key={category.id}
              category={category}
              items={checklistState[category.id] || []}
              onToggleItem={(itemId, completed) => 
                toggleItem(category.id, itemId, completed)
              }
              onAddCustomItem={() => {
                setSelectedCategory(category.id);
                setShowAddModal(true);
              }}
            />
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-primary-50 rounded-xl p-6">
          <h3 className="font-semibold text-primary-900 mb-2">✨ Packing Tips</h3>
          <ul className="text-sm text-primary-800 space-y-2">
            <li>• Roll your clothes instead of folding to save space</li>
            <li>• Pack a small first-aid kit even if you're healthy</li>
            <li>• Keep important documents in your carry-on</li>
            <li>• Leave some space for souvenirs!</li>
            <li>• Check weather forecast 2 days before departure</li>
          </ul>
        </div>
      </div>

      {/* Add Custom Item Modal */}
      <AddCustomItemModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedCategory(null);
        }}
        onSave={addCustomItem}
        categoryId={selectedCategory}
      />
    </div>
  );
};

export default ChecklistPage;