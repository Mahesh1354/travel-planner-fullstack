package com.travelplanner.backend.dto.amadeus;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HotelOfferDTO {
    private String hotelId;
    private String hotelName;
    private String address;
    private String city;
    private String country;
    private double latitude;
    private double longitude;
    private double pricePerNight;
    private String currency;
    private int availableRooms;
    private List<String> amenities;
    private double rating;
    private int reviewCount;
    private String description;
    private List<String> images;
}