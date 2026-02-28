package com.travelplanner.backend.dto.places;

import lombok.Data;

@Data
public class PlaceSearchRequest {
    private String category;  // tourism.attraction, catering.restaurant, accommodation.hotel, etc.
    private double latitude;
    private double longitude;
    private int radius = 5000;  // meters
    private int limit = 20;
    private String query;  // for text search

    @Override
    public String toString() {
        return "PlaceSearchRequest{" +
                "category='" + category + '\'' +
                ", lat=" + latitude +
                ", lon=" + longitude +
                ", radius=" + radius +
                ", limit=" + limit +
                ", query='" + query + '\'' +
                '}';
    }
}