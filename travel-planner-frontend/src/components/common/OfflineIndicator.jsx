import React from 'react';
import { useOffline } from '../../hooks/useOffline';
import { WifiIcon, CloudIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const OfflineIndicator = () => {
  const { isOnline, syncProgress, pendingSync, syncPendingChanges } = useOffline();

  if (isOnline && pendingSync.length === 0) {
    return null; // Don't show anything when online and no pending sync
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isOnline ? (
        // Offline indicator
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-lg flex items-center">
          <WifiIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">You're offline</span>
        </div>
      ) : syncProgress ? (
        // Syncing indicator
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center mb-1">
            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
            <span className="text-sm font-medium">Syncing...</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(syncProgress.completed / syncProgress.total) * 100}%` }}
            />
          </div>
        </div>
      ) : pendingSync.length > 0 && (
        // Pending sync indicator
        <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg shadow-lg flex items-center">
          <CloudIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium mr-3">
            {pendingSync.length} change{pendingSync.length !== 1 ? 's' : ''} pending
          </span>
          <button
            onClick={syncPendingChanges}
            className="text-xs bg-purple-200 hover:bg-purple-300 px-2 py-1 rounded"
          >
            Sync now
          </button>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;