package com.travelplanner.backend.service;

import com.travelplanner.backend.dto.places.AutocompleteSuggestion;
import com.travelplanner.backend.dto.places.PlaceDTO;
import com.travelplanner.backend.dto.places.PlaceSearchRequest;
import java.util.List;

public interface PlacesService {

    List<PlaceDTO> searchPlaces(PlaceSearchRequest request);

    List<AutocompleteSuggestion> autocomplete(String query, double lat, double lon);

    PlaceDTO getPlaceDetails(String placeId);

    List<String> getPlaceCategories();

    List<PlaceDTO> searchNearby(double lat, double lon, int radius, String category);

    List<PlaceDTO> searchByText(String text, double lat, double lon, int limit);
}