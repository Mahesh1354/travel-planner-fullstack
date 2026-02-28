package com.travelplanner.backend.client;

import com.travelplanner.backend.dto.request.RecommendationRequest;
import com.travelplanner.backend.dto.response.RecommendationResponse;
import com.travelplanner.backend.dto.response.PlaceResponse;
import java.util.List;

public interface RecommendationApiClient {

    List<RecommendationResponse> getRecommendations(RecommendationRequest request);

    List<PlaceResponse> searchPlaces(String location, String query, int limit);

    PlaceResponse getPlaceDetails(String placeId);

    List<String> getPopularCategories(String location);
}