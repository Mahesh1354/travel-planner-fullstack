package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfflineStatusResponse {
    private Long userId;
    private Integer totalOfflineTrips;
    private Long totalStorageUsed;
    private Long availableStorage; // Based on device or limit
    private List<OfflineTripSummary> trips;
    private Map<String, Integer> stats;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OfflineTripSummary {
        private Long tripId;
        private String tripTitle;
        private LocalDateTime downloadedAt;
        private LocalDateTime expiresAt;
        private Long fileSize;
        private Boolean needsUpdate;
        private LocalDateTime lastAccessed;
    }
}