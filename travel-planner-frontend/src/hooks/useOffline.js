import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import offlineAPI from "../api/offline";
import tripsAPI from "../api/trips";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

export const useOffline = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncProgress, setSyncProgress] = useState(null);
  const [pendingSync, setPendingSync] = useState([]);

  // Define syncPendingChanges FIRST before it's used
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline || pendingSync.length === 0 || !isAuthenticated) return;

    setSyncProgress({ total: pendingSync.length, completed: 0 });

    for (let i = 0; i < pendingSync.length; i++) {
      const change = pendingSync[i];
      try {
        switch (change.type) {
          case "CREATE_TRIP":
            await tripsAPI.createTrip(change.data);
            break;
          case "UPDATE_TRIP":
            await tripsAPI.updateTrip(change.id, change.data);
            break;
          case "DELETE_TRIP":
            await tripsAPI.deleteTrip(change.id);
            break;
        }

        setSyncProgress((prev) => ({
          ...prev,
          completed: prev.completed + 1,
        }));

        setPendingSync((prev) => prev.filter((_, index) => index !== i));
      } catch (error) {
        console.error("Sync failed for change:", change, error);
      }
    }

    setSyncProgress(null);
    toast.success("All changes synced successfully!");
  }, [isOnline, pendingSync, isAuthenticated]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You are back online!");
      syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline. Changes will be saved locally.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncPendingChanges]);

  // Get offline status - this has the trips array
  // Get offline status - only if authenticated
  const {
    data: offlineStatus,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ["offlineStatus"],
    queryFn: async () => {
      try {
        const response = await offlineAPI.getOfflineStatus();
        console.log("Raw offline status response:", response);

        // Handle different response formats
        if (response?.data) {
          return response.data;
        } else if (response) {
          return response;
        }
        return { totalOfflineTrips: 0, totalStorageUsed: 0, trips: [] };
      } catch (error) {
        console.warn("Failed to fetch offline status:", error);
        return { totalOfflineTrips: 0, totalStorageUsed: 0, trips: [] };
      }
    },
    enabled: isOnline && isAuthenticated,
  });

  // Extract trips from status response
  const offlineTrips = offlineStatus?.trips || [];

  // Download trip for offline
  const downloadTripMutation = useMutation({
    mutationFn: ({ tripId, forceRefresh = false }) =>
      offlineAPI.downloadTrip(tripId, forceRefresh),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["offlineStatus"] });
      setTimeout(() => refetchStatus(), 500);
      toast.success("Trip downloaded for offline access");
      return response?.data;
    },
    onError: (error) => {
      if (error.response?.status === 403) {
        toast.error("Please login to download trips");
      } else {
        toast.error(error.response?.data?.message || "Failed to download trip");
      }
    },
  });

  // Download multiple trips
  const downloadTripsMutation = useMutation({
    mutationFn: (data) => offlineAPI.downloadTrips(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["offlineStatus"] });
      setTimeout(() => refetchStatus(), 500);
      toast.success("Trips downloaded for offline access");
      return response?.data;
    },
    onError: (error) => {
      if (error.response?.status === 403) {
        toast.error("Please login to download trips");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to download trips",
        );
      }
    },
  });

  // Refresh single trip
  const refreshTripMutation = useMutation({
    mutationFn: (tripId) => offlineAPI.refreshTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offlineStatus"] });
      setTimeout(() => refetchStatus(), 500);
      toast.success("Trip refreshed successfully");
    },
    onError: (error) => {
      if (error.response?.status === 403) {
        toast.error("Please login to refresh trips");
      } else {
        toast.error(error.response?.data?.message || "Failed to refresh trip");
      }
    },
  });

  // Refresh all offline data
  const refreshAllMutation = useMutation({
    mutationFn: () => offlineAPI.refreshAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offlineStatus"] });
      setTimeout(() => refetchStatus(), 500);
      toast.success("All offline data refreshed");
    },
    onError: (error) => {
      if (error.response?.status === 403) {
        toast.error("Please login to refresh data");
      } else {
        toast.error(error.response?.data?.message || "Failed to refresh data");
      }
    },
  });

  // Delete offline trip
  const deleteOfflineTripMutation = useMutation({
    mutationFn: (tripId) => offlineAPI.deleteOfflineTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offlineStatus"] });
      setTimeout(() => refetchStatus(), 500);
      toast.success("Offline trip deleted");
    },
    onError: (error) => {
      if (error.response?.status === 403) {
        toast.error("Please login to delete trips");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to delete offline trip",
        );
      }
    },
  });

  // Delete all offline data
  const deleteAllOfflineMutation = useMutation({
    mutationFn: () => offlineAPI.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offlineStatus"] });
      setTimeout(() => refetchStatus(), 500);
      toast.success("All offline data cleared");
    },
    onError: (error) => {
      if (error.response?.status === 403) {
        toast.error("Please login to clear data");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to clear offline data",
        );
      }
    },
  });

  // Add pending change
  const addPendingChange = useCallback((change) => {
    setPendingSync((prev) => {
      const newPending = [...prev, { ...change, timestamp: Date.now() }];
      localStorage.setItem("pendingSync", JSON.stringify(newPending));
      return newPending;
    });
  }, []);

  // Load pending changes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pendingSync");
    if (saved) {
      try {
        setPendingSync(JSON.parse(saved));
      } catch {
        console.warn("Failed to parse pending sync data");
      }
    }
  }, []);

  // Save pending changes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pendingSync", JSON.stringify(pendingSync));
  }, [pendingSync]);

  // Check if a specific trip is available offline
  const isTripAvailableOffline = useCallback(
    (tripId) => {
      if (!offlineTrips || offlineTrips.length === 0) {
        console.log("No offline trips available");
        return false;
      }

      const numericTripId = Number(tripId);
      console.log(
        "Checking for trip:",
        numericTripId,
        "in offlineTrips:",
        offlineTrips,
      );

      const found = offlineTrips.some(
        (trip) =>
          trip.tripId === numericTripId ||
          trip.tripId === tripId ||
          trip.id === numericTripId ||
          trip.id === tripId,
      );

      console.log("isTripAvailableOffline result:", found);
      return found;
    },
    [offlineTrips],
  );

  // Get total storage used by offline data

  const getStorageUsed = useCallback(() => {
    if (!offlineStatus) return "0 MB";

    // Try different possible field names
    const bytes =
      offlineStatus.totalStorageUsed ||
      offlineStatus.totalSize ||
      offlineStatus.storageUsed ||
      0;

    if (bytes === 0) return "0 MB";

    // Convert bytes to MB (1 MB = 1024 * 1024 bytes)
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    return `${mb} MB`;
  }, [offlineStatus]);

  return {
    // State
    isOnline,
    syncProgress,
    pendingSync,
    offlineTrips: offlineTrips, // Now using trips from status
    offlineStatus: offlineStatus || {
      totalOfflineTrips: 0,
      totalStorageUsed: 0,
      trips: [],
    },

    // Loading states
    offlineLoading: statusLoading || false,
    statusLoading: statusLoading || false,

    // Actions
    downloadTrip: downloadTripMutation.mutateAsync,
    downloadTrips: downloadTripsMutation.mutateAsync,
    refreshTrip: refreshTripMutation.mutateAsync,
    refreshAll: refreshAllMutation.mutateAsync,
    deleteOfflineTrip: deleteOfflineTripMutation.mutateAsync,
    deleteAllOffline: deleteAllOfflineMutation.mutateAsync,

    // Utility functions
    isTripAvailableOffline,
    getStorageUsed,
    addPendingChange,
    syncPendingChanges,

    // Mutation states
    isDownloading: downloadTripMutation.isPending || false,
    isRefreshing: refreshAllMutation.isPending || false,
    isDeleting: deleteAllOfflineMutation.isPending || false,

    // Refetch
    refetchStatus,
  };
};
