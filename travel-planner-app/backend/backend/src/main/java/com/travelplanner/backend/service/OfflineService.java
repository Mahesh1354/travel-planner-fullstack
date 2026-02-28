package com.travelplanner.backend.service;

import com.travelplanner.backend.dto.request.OfflineSyncRequest;
import com.travelplanner.backend.dto.request.OfflineDataRequest;
import com.travelplanner.backend.dto.response.OfflineDataResponse;
import com.travelplanner.backend.dto.response.OfflineSyncResponse;
import com.travelplanner.backend.dto.response.OfflineStatusResponse;
import java.util.List;

public interface OfflineService {

    // Download operations
    OfflineSyncResponse downloadTripsForOffline(String userEmail, OfflineSyncRequest request);

    OfflineDataResponse downloadSingleTrip(String userEmail, Long tripId, Boolean forceRefresh);

    // Access operations
    OfflineDataResponse getOfflineTripData(String userEmail, Long tripId);

    List<OfflineDataResponse> getAllOfflineTrips(String userEmail);

    OfflineStatusResponse getOfflineStatus(String userEmail);

    // Update operations
    OfflineDataResponse refreshOfflineData(String userEmail, Long tripId);

    OfflineSyncResponse refreshAllOfflineData(String userEmail);

    // Delete operations
    void deleteOfflineData(String userEmail, Long tripId);

    void deleteAllOfflineData(String userEmail);

    void deleteExpiredOfflineData(String userEmail);

    // Validation
    boolean isOfflineDataValid(String userEmail, Long tripId);

    boolean needsUpdate(String userEmail, Long tripId, Integer currentVersion);

    // System operations
    void cleanupExpiredData();
}