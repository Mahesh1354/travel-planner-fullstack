package com.travelplanner.backend.service;

import com.travelplanner.backend.dto.amadeus.AirportDTO;
import com.travelplanner.backend.dto.request.FlightSearchRequest;
import com.travelplanner.backend.dto.request.AccommodationSearchRequest;
import com.travelplanner.backend.dto.request.ActivitySearchRequest;
import com.travelplanner.backend.dto.response.FlightSearchResponse;
import com.travelplanner.backend.dto.response.AccommodationSearchResponse;
import com.travelplanner.backend.dto.response.ActivitySearchResponse;
import java.util.List;

public interface SearchService {

    FlightSearchResponse searchFlights(FlightSearchRequest request);

    AccommodationSearchResponse searchAccommodations(AccommodationSearchRequest request);

    ActivitySearchResponse searchActivities(ActivitySearchRequest request);

    List<AirportDTO> searchAirports(String keyword);
}