package com.travelplanner.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OfflineDataRequest {

    @NotNull(message = "Trip ID is required")
    private Long tripId;

    private Boolean forceRefresh = false; // Force refresh even if not expired

    private String deviceInfo;
}