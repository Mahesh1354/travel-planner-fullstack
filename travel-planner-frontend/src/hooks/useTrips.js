import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import tripsAPI from '../api/trips';
import toast from 'react-hot-toast';

export const useTrips = () => {
  const queryClient = useQueryClient();

  // Get all trips
  const {
    data: trips,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      try {
        const response = await tripsAPI.getAllTrips();
        // Handle different response formats
        if (Array.isArray(response)) {
          return response;
        } else if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch trips:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Get shared trips
  const {
    data: sharedTrips,
    isLoading: sharedLoading,
  } = useQuery({
    queryKey: ['sharedTrips'],
    queryFn: async () => {
      try {
        const response = await tripsAPI.getSharedTrips();
        if (Array.isArray(response)) {
          return response;
        } else if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch shared trips:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Get user invitations
  const {
    data: invitations,
    isLoading: invitationsLoading,
    refetch: refetchInvitations,
  } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      try {
        const response = await tripsAPI.getUserInvitations();
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Failed to fetch invitations:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });

  // Create trip mutation
  const createTripMutation = useMutation({
    mutationFn: (tripData) => tripsAPI.createTrip(tripData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create trip');
    },
  });

  // Update trip mutation
  const updateTripMutation = useMutation({
    mutationFn: ({ id, data }) => tripsAPI.updateTrip(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update trip');
    },
  });

  // Delete trip mutation
  const deleteTripMutation = useMutation({
    mutationFn: (id) => tripsAPI.deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete trip');
    },
  });

  // Share trip mutation
  const shareTripMutation = useMutation({
    mutationFn: ({ tripId, shareData }) => tripsAPI.shareTrip(tripId, shareData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip'] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Trip shared successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to share trip');
    },
  });

  // Duplicate trip mutation
  const duplicateTripMutation = useMutation({
    mutationFn: (tripId) => tripsAPI.duplicateTrip(tripId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip duplicated successfully!');
      return response.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate trip');
    },
  });

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: (invitationId) => tripsAPI.acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['sharedTrips'] });
      toast.success('Invitation accepted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    },
  });

  // Decline invitation mutation
  const declineInvitationMutation = useMutation({
    mutationFn: (invitationId) => tripsAPI.declineInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation declined');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to decline invitation');
    },
  });

  return {
    // Data
    trips: trips || [],
    sharedTrips: sharedTrips || [],
    invitations: invitations || [],
    
    // Loading states
    loading,
    sharedLoading,
    invitationsLoading,
    
    // Error
    error,
    
    // Refetch functions
    refetch,
    refetchInvitations,
    
    // Mutations
    createTrip: createTripMutation.mutateAsync,
    updateTrip: updateTripMutation.mutateAsync,
    deleteTrip: deleteTripMutation.mutateAsync,
    shareTrip: shareTripMutation.mutateAsync,
    duplicateTrip: duplicateTripMutation.mutateAsync,
    acceptInvitation: acceptInvitationMutation.mutateAsync,
    declineInvitation: declineInvitationMutation.mutateAsync,
    
    // Loading states for mutations
    isCreating: createTripMutation.isPending,
    isUpdating: updateTripMutation.isPending,
    isDeleting: deleteTripMutation.isPending,
    isSharing: shareTripMutation.isPending,
    isDuplicating: duplicateTripMutation.isPending,
  };
};