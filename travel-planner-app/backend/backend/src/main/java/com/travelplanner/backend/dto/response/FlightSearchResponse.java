package com.travelplanner.backend.dto.response;

import com.travelplanner.backend.dto.amadeus.FlightOfferDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightSearchResponse {
    private List<FlightOfferDTO> flights;
    private int totalResults;
    private String searchId;
    private String errorMessage;

    // Helper constructor for success
    public FlightSearchResponse(List<FlightOfferDTO> flights) {
        this.flights = flights != null ? flights : new ArrayList<>();
        this.totalResults = this.flights.size();
        this.searchId = "FLIGHT-SEARCH-" + System.currentTimeMillis();
        this.errorMessage = null;
    }

    // Helper constructor for error
    public FlightSearchResponse(String errorMessage) {
        this.flights = new ArrayList<>();
        this.totalResults = 0;
        this.searchId = "FLIGHT-SEARCH-ERROR-" + System.currentTimeMillis();
        this.errorMessage = errorMessage;
    }
}