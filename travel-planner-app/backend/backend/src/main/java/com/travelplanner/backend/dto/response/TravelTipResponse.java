package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TravelTipResponse {
    private Long id;
    private String destinationCountry;
    private String destinationCity;
    private String tipType;
    private String title;
    private String description;
    private String source;
    private Boolean isGovernmentAdvice;
    private LocalDate lastUpdated;
}