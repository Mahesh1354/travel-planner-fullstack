import apiClient from './client';

const recommendationsAPI = {
  // Update user preferences
  updatePreferences: (preferences) => 
    apiClient.put('/recommendations/preferences', preferences),

  // Get user preferences
  getPreferences: () => 
    apiClient.get('/recommendations/preferences'),

  // Delete user preferences
  deletePreferences: () => 
    apiClient.delete('/recommendations/preferences'),

  // Get recommendations for a location
  getRecommendations: (params) => 
    apiClient.post('/recommendations/places', params),

  // Search places
  searchPlaces: (location, query, limit = 5) => 
    apiClient.get(`/recommendations/places/search?location=${location}&query=${query}&limit=${limit}`),

  // Get place details
  getPlaceDetails: (placeId) => 
    apiClient.get(`/recommendations/places/${placeId}`),

  // Get travel tips by destination
  getTravelTips: (destination) => 
    apiClient.get(`/recommendations/tips/destination/${destination}`),

  // Get filtered travel tips
  getFilteredTips: (country, city, tipType) => {
    let url = '/recommendations/tips?';
    if (country) url += `country=${country}&`;
    if (city) url += `city=${city}&`;
    if (tipType) url += `tipType=${tipType}`;
    return apiClient.get(url);
  },

  // Get tip details
  getTipDetails: (tipId) => 
    apiClient.get(`/recommendations/tips/${tipId}`),
};

export default recommendationsAPI;