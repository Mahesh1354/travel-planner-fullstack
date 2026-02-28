package com.travelplanner.backend.dto.response;

import com.travelplanner.backend.dto.places.PlaceDTO;
import com.travelplanner.backend.dto.weather.WeatherDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DestinationResponse {
    private Long id;
    private String name;
    private String country;
    private String city;
    private LocalDate arrivalDate;
    private LocalDate departureDate;
    private String accommodationName;
    private String accommodationAddress;
    private String accommodationConfirmation;
    private Double latitude;  // Added
    private Double longitude; // Added
    private String notes;
    private List<ActivityResponse> activities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer nights;
    private Integer activityCount;
    private WeatherDTO weather;
    private List<PlaceDTO> nearbyPlaces;

}