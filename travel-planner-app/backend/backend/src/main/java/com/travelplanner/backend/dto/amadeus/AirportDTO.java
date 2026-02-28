package com.travelplanner.backend.dto.amadeus;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AirportDTO {
    private String code;
    private String name;
    private String city;
    private String country;
    private double latitude;
    private double longitude;
}