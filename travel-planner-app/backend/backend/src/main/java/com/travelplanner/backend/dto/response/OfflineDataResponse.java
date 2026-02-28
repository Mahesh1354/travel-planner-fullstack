package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfflineDataResponse {
    private Long id;
    private Long tripId;
    private String tripTitle;
    private Integer dataVersion;
    private String data; // JSON data
    private LocalDateTime downloadedAt;
    private LocalDateTime lastAccessedAt;
    private LocalDateTime expiresAt;
    private Long fileSize;
    private String checksum;
    private Boolean isValid;
    private Long remainingDays;
}