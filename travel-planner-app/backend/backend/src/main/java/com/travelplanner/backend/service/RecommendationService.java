package com.travelplanner.backend.service;

import com.travelplanner.backend.dto.request.RecommendationRequest;
import com.travelplanner.backend.dto.request.UserPreferenceRequest;
import com.travelplanner.backend.dto.response.RecommendationResponse;
import com.travelplanner.backend.dto.response.PlaceResponse;
import com.travelplanner.backend.dto.response.TravelTipResponse;
import com.travelplanner.backend.entity.UserPreference;
import java.util.List;

public interface RecommendationService {

    // Recommendations
    List<RecommendationResponse> getRecommendations(String userEmail, RecommendationRequest request);

    List<PlaceResponse> searchPlaces(String userEmail, String location, String query, int limit);

    PlaceResponse getPlaceDetails(String userEmail, String placeId);

    // User Preferences
    UserPreference getUserPreferences(String userEmail);

    UserPreference updateUserPreferences(String userEmail, UserPreferenceRequest request);

    void deleteUserPreferences(String userEmail);

    // Travel Tips
    List<TravelTipResponse> getTravelTips(String country, String city, String tipType);

    List<TravelTipResponse> getTipsForDestination(String destination);

    TravelTipResponse getTipDetails(Long tipId);
}