import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationsAPI from '../api/notifications';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  // Get all notifications
  const {
    data: notifications,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const response = await notificationsAPI.getAllNotifications();
        return response?.data || []; // Always return array
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return []; // Return empty array on error
      }
    },
  });

  // Get unread count
  const {
    data: unreadCount,
    isLoading: countLoading,
  } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      try {
        const response = await notificationsAPI.getUnreadCount();
        return response?.count || 0; // Always return number
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        return 0; // Return 0 on error
      }
    },
    refetchInterval: 30000,
  });

  // Get preferences
  const {
    data: preferences,
    isLoading: preferencesLoading,
  } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: async () => {
      try {
        const response = await notificationsAPI.getPreferences();
        return response?.data || null;
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
        return null;
      }
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success('All notifications marked as read');
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs) => notificationsAPI.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Preferences updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (id) => notificationsAPI.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success('Notification deleted');
    },
  });

  // Delete all notifications mutation
  const deleteAllMutation = useMutation({
    mutationFn: () => notificationsAPI.deleteAllNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success('All notifications cleared');
    },
  });

  return {
    notifications: notifications || [],
    unreadCount: unreadCount || 0,
    preferences: preferences || null,
    loading,
    countLoading,
    preferencesLoading,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutate,
    deleteAllNotifications: deleteAllMutation.mutateAsync,
    isUpdating: updatePreferencesMutation.isPending,
  };
};