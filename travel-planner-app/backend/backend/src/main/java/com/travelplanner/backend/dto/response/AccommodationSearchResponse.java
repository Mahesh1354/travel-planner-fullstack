package com.travelplanner.backend.dto.response;

import com.travelplanner.backend.dto.amadeus.HotelOfferDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccommodationSearchResponse {
    private List<HotelOfferDTO> accommodations;
    private int totalResults;
    private String searchId;
    private String errorMessage;  // Added for error cases

    // Helper constructor for success
    public AccommodationSearchResponse(List<HotelOfferDTO> accommodations) {
        this.accommodations = accommodations != null ? accommodations : new ArrayList<>();
        this.totalResults = this.accommodations.size();
        this.searchId = "HOTEL-SEARCH-" + System.currentTimeMillis();
        this.errorMessage = null;
    }

    // Helper constructor for error
    public AccommodationSearchResponse(String errorMessage) {
        this.accommodations = new ArrayList<>();
        this.totalResults = 0;
        this.searchId = "HOTEL-SEARCH-ERROR-" + System.currentTimeMillis();
        this.errorMessage = errorMessage;
    }
}