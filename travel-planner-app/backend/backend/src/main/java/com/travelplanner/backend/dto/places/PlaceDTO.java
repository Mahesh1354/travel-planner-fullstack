package com.travelplanner.backend.dto.places;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceDTO {
    private String placeId;
    private String name;
    private String address;
    private String street;
    private String houseNumber;
    private String city;
    private String country;
    private String postcode;
    private double latitude;
    private double longitude;
    private List<String> categories;
    private String website;
    private String phone;
    private String openingHours;
    private double distance;
    private String formattedAddress;
    private String icon;
    private String state;
    private String suburb;
    private String description;
}