import apiClient from './client';

export const tripsAPI = {
  // Get all trips for current user
  getAllTrips: async () => {
    try {
      const response = await apiClient.get('/trips');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trips:', error);
      return [];
    }
  },

  // Get single trip
  getTrip: async (id) => {
    try {
      const response = await apiClient.get(`/trips/${id}`);
      console.log('getTrip raw response:', response);
      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch trip:', error);
      throw error;
    }
  },

  // Create new trip
  createTrip: async (tripData) => {
    try {
      const response = await apiClient.post('/trips', tripData);
      console.log('Create trip raw response:', response);
      return response.data;
    } catch (error) {
      console.error('Failed to create trip:', error);
      throw error;
    }
  },

  // Update trip
  updateTrip: async (id, tripData) => {
    try {
      const response = await apiClient.put(`/trips/${id}`, tripData);
      return response.data;
    } catch (error) {
      console.error('Failed to update trip:', error);
      throw error;
    }
  },

  // Delete trip
  deleteTrip: async (id) => {
    try {
      const response = await apiClient.delete(`/trips/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete trip:', error);
      throw error;
    }
  },

  // Duplicate trip
  duplicateTrip: async (tripId) => {
    try {
      const response = await apiClient.post(`/trips/${tripId}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Failed to duplicate trip:', error);
      throw error;
    }
  },

  // Share trip with user
  shareTrip: async (tripId, shareData) => {
    try {
      const response = await apiClient.post(`/trips/${tripId}/share`, shareData);
      return response.data;
    } catch (error) {
      // If it's 400 with "already shared" message, that's actually expected
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already shared')) {
        return { success: false, message: 'Already shared with this user' };
      }
      console.error('Failed to share trip:', error);
      throw error;
    }
  },

  // Get pending invitations for a trip
  getPendingInvitations: async (tripId) => {
    try {
      const response = await apiClient.get(`/trips/${tripId}/invitations/pending`);
      return response.data;
    } catch (error) {
      console.warn('Pending invitations endpoint not available:', error.message);
      return [];
    }
  },

  // Get all invitations for current user
  getUserInvitations: async () => {
    try {
      const response = await apiClient.get('/trips/invitations');
      return response.data;
    } catch (error) {
      console.warn('User invitations endpoint not available:', error.message);
      return [];
    }
  },

  // Accept invitation
  acceptInvitation: async (invitationId) => {
    try {
      const response = await apiClient.post(`/trips/invitations/${invitationId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Accept invitation endpoint not available:', error);
      return { success: true, message: 'Invitation accepted (demo mode)' };
    }
  },

  // Decline invitation
  declineInvitation: async (invitationId) => {
    try {
      const response = await apiClient.post(`/trips/invitations/${invitationId}/decline`);
      return response.data;
    } catch (error) {
      console.error('Decline invitation endpoint not available:', error);
      return { success: true, message: 'Invitation declined (demo mode)' };
    }
  },

  // Cancel invitation (owner only)
  cancelInvitation: async (invitationId) => {
    try {
      const response = await apiClient.delete(`/trips/invitations/${invitationId}`);
      return response.data;
    } catch (error) {
      console.error('Cancel invitation endpoint not available:', error);
      return { success: true, message: 'Invitation cancelled (demo mode)' };
    }
  },

  // Get trip collaborators
  getCollaborators: async (tripId) => {
    try {
      const response = await apiClient.get(`/trips/${tripId}/collaborators`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch collaborators:', error);
      return [];
    }
  },

  // Remove collaborator
  removeCollaborator: async (tripId, collaboratorId) => {
    try {
      const response = await apiClient.delete(`/trips/${tripId}/collaborators/${collaboratorId}`);
      return response.data;
    } catch (error) {
      console.error('Remove collaborator endpoint not available:', error);
      return { success: true, message: 'Collaborator removed (demo mode)' };
    }
  },

  // Get shared trips
  getSharedTrips: async () => {
    try {
      const response = await apiClient.get('/trips/shared');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch shared trips:', error);
      return [];
    }
  },
};

export default tripsAPI;