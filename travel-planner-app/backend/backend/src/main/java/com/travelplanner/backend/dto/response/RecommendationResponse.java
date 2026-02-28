package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private String id;
    private PlaceResponse place;
    private double score; // recommendation score (0-1)
    private String reason; // why this is recommended
    private String category;
}