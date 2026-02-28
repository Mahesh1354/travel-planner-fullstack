package com.travelplanner.backend.dto.places;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutocompleteSuggestion {
    private String placeId;
    private String text;
    private String formattedAddress;
    private double latitude;
    private double longitude;
    private String type;  // city, address, place, etc.
}