package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceResponse {
    private String id;
    private String name;
    private String city;
    private String country;
    private String description;
    private String category;
    private double rating;
    private int totalReviews;
    private double price;
    private String priceLevel;
    private String imageUrl;
    private double latitude;
    private double longitude;
    private String address;
    private String website;
    private String phoneNumber;
    private List<String> openingHours;
    private List<String> tags;
}