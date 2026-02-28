package com.travelplanner.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class RecommendationRequest {

    @NotBlank(message = "Location is required")
    private String location; // "Paris, France" or "New York"

    private List<String> categories; // e.g., ["SIGHTSEEING", "FOOD", "CULTURAL"]

    private String budgetLevel; // BUDGET, MID_RANGE, LUXURY

    private Integer limit = 10;

    private Double latitude; // for location-based recommendations

    private Double longitude;

    private Integer radius; // search radius in meters

    private String sortBy; // RATING, DISTANCE, PRICE

    private String userId; // for personalized recommendations
}