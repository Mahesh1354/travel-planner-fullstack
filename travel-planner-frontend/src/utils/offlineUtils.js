import { useOffline } from '../hooks/useOffline';

// Helper to handle actions that might need offline support
export const useOfflineAction = () => {
  const { isOnline, addPendingChange } = useOffline();

  const executeAction = async (action, offlineData) => {
    if (isOnline) {
      // If online, execute immediately
      return await action();
    } else {
      // If offline, queue for later sync
      addPendingChange(offlineData);
      // Show a toast or notification
      return { offline: true, message: 'Action saved offline. Will sync when back online.' };
    }
  };

  return { executeAction };
};