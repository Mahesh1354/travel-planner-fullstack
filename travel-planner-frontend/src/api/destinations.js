import apiClient from './client';

export const destinationsAPI = {
  // Add destination to trip
  addDestination: (tripId, destinationData) => 
    apiClient.post(`/trips/${tripId}/destinations`, destinationData),

  // Get trip destinations
  getDestinations: (tripId) => apiClient.get(`/trips/${tripId}/destinations`),

  // Update destination
  updateDestination: (destinationId, destinationData) => 
    apiClient.put(`/trips/destinations/${destinationId}`, destinationData),

  // Delete destination
  deleteDestination: (destinationId) => 
    apiClient.delete(`/trips/destinations/${destinationId}`),
};

export default destinationsAPI;