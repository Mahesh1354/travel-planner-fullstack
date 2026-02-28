package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivitySearchResponse {
    private List<ActivityOption> activities;
    private int totalResults;
    private String searchId;
    private String errorMessage;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityOption {
        private String id;
        private String name;
        private String type;
        private String location;
        private double pricePerPerson;
        private double totalPrice;
        private String currency;
        private int availableSpots;
        private int minParticipants;
        private int maxParticipants;
        private boolean instantConfirmation;
        private String startTime;
        private String endTime;
    }

    // Helper constructor for success
    public ActivitySearchResponse(List<ActivityOption> activities) {
        this.activities = activities != null ? activities : new ArrayList<>();
        this.totalResults = this.activities.size();
        this.searchId = "ACTIVITY-SEARCH-" + System.currentTimeMillis();
        this.errorMessage = null;
    }

    // Helper constructor for error
    public ActivitySearchResponse(String errorMessage) {
        this.activities = new ArrayList<>();
        this.totalResults = 0;
        this.searchId = "ACTIVITY-SEARCH-ERROR-" + System.currentTimeMillis();
        this.errorMessage = errorMessage;
    }
}