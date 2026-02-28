import apiClient from './client';

export const activitiesAPI = {
  // Add activity to destination
  addActivity: (destinationId, activityData) => 
    apiClient.post(`/trips/destinations/${destinationId}/activities`, activityData),

  // Get destination activities
  getActivities: (destinationId) => 
    apiClient.get(`/trips/destinations/${destinationId}/activities`),

  // Update activity
  updateActivity: (activityId, activityData) => 
    apiClient.put(`/trips/activities/${activityId}`, activityData),

  // Delete activity
  deleteActivity: (activityId) => 
    apiClient.delete(`/trips/activities/${activityId}`),
};

export default activitiesAPI;