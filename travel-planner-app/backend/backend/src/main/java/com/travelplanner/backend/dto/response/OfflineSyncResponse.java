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
public class OfflineSyncResponse {
    private String syncId;
    private Integer totalTrips;
    private Integer successfulDownloads;
    private Integer failedDownloads;
    private List<Long> downloadedTripIds;
    private Map<Long, String> errors;
    private Long totalDataSize;
    private LocalDateTime syncStartedAt;
    private LocalDateTime syncCompletedAt;
    private String status;
}