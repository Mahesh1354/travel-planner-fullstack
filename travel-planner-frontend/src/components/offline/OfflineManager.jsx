import React, { useEffect, useState } from 'react';
import { useOffline } from '../../hooks/useOffline';
import { 
  CloudArrowDownIcon, 
  CloudIcon,
  ArrowPathIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const OfflineManager = ({ tripId, tripTitle }) => {
  const {
    isOnline,
    offlineTrips,
    isTripAvailableOffline,
    downloadTrip,
    deleteOfflineTrip,
    refreshTrip,
    getStorageUsed,
    isDownloading,
    isRefreshing,
    isDeleting,
    pendingSync
  } = useOffline();

  const [storageDisplay, setStorageDisplay] = useState('0 MB');

  // Calculate storage used from offlineTrips
  useEffect(() => {
    if (offlineTrips && offlineTrips.length > 0) {
      // Try to get fileSize from the trip data
      let totalBytes = 0;
      offlineTrips.forEach(trip => {
        if (trip.fileSize) {
          totalBytes += trip.fileSize;
        }
      });
      
      if (totalBytes > 0) {
        const mb = (totalBytes / (1024 * 1024)).toFixed(2);
        setStorageDisplay(`${mb} MB`);
      } else {
        // Fallback to the getStorageUsed function
        setStorageDisplay(getStorageUsed());
      }
    } else {
      setStorageDisplay('0 MB');
    }
  }, [offlineTrips, getStorageUsed]);

  // Add debug logging
  useEffect(() => {
    console.log('OfflineManager - Trip ID:', tripId);
    console.log('OfflineManager - offlineTrips:', offlineTrips);
    console.log('OfflineManager - isAvailable:', isTripAvailableOffline(tripId));
  }, [tripId, offlineTrips, isTripAvailableOffline]);

  const isAvailable = isTripAvailableOffline(tripId);

  const handleDownload = async () => {
    try {
      await downloadTrip({ tripId, forceRefresh: false });
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshTrip(tripId);
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Remove "${tripTitle}" from offline storage?`)) {
      try {
        await deleteOfflineTrip(tripId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Offline Access</h3>
        <div className="flex items-center">
          <CloudIcon className={`h-4 w-4 mr-1 ${isOnline ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="text-xs text-gray-500">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {storageDisplay !== '0 MB' && (
        <p className="text-xs text-gray-500 mb-3">
          Storage used: {storageDisplay}
        </p>
      )}

      <div className="space-y-2">
        {!isAvailable ? (
          <button
            onClick={handleDownload}
            disabled={!isOnline || isDownloading}
            className="w-full btn-secondary text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                Download for offline
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="font-medium">Available offline</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleRefresh}
                disabled={!isOnline || isRefreshing}
                className="btn-secondary text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed py-2"
              >
                {isRefreshing ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </button>
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-secondary text-sm text-red-600 hover:bg-red-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed py-2"
              >
                {isDeleting ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {!isOnline && pendingSync?.length > 0 && (
        <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <svg className="animate-spin h-3 w-3 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {pendingSync.length} change{pendingSync.length !== 1 ? 's' : ''} pending sync
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineManager;