package com.travelplanner.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class OfflineSyncRequest {

    @NotNull(message = "Trip IDs are required")
    private List<Long> tripIds; // List of trip IDs to download

    private Boolean includeExpired = false; // Whether to include expired data

    private Boolean forceRefresh = false;

    private Integer syncDays = 30; // Number of days to keep data

    private String deviceInfo; // Information about the device
}