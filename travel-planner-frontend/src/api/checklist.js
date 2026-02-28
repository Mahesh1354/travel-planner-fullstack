import apiClient from './client';

const checklistAPI = {
  // Get checklist for a trip
  getTripChecklist: (tripId) => 
    apiClient.get(`/checklist/trip/${tripId}`),

  // Create checklist for a trip
  createChecklist: (tripId, checklistData) => 
    apiClient.post(`/checklist/trip/${tripId}`, checklistData),

  // Update checklist item
  updateChecklistItem: (tripId, itemId, itemData) => 
    apiClient.put(`/checklist/trip/${tripId}/item/${itemId}`, itemData),

  // Toggle checklist item status
  toggleChecklistItem: (tripId, itemId, completed) => 
    apiClient.patch(`/checklist/trip/${tripId}/item/${itemId}`, { completed }),

  // Add custom item to checklist
  addCustomItem: (tripId, itemData) => 
    apiClient.post(`/checklist/trip/${tripId}/custom`, itemData),

  // Delete checklist item
  deleteChecklistItem: (tripId, itemId) => 
    apiClient.delete(`/checklist/trip/${tripId}/item/${itemId}`),

  // Get pre-departure checklist
  getPreDepartureChecklist: () => 
    apiClient.get('/checklist/pre-departure'),

  // Get weather-based recommendations
  getWeatherRecommendations: (weatherCondition) => 
    apiClient.get(`/checklist/weather?condition=${weatherCondition}`),
};

export default checklistAPI;