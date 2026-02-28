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
public class FlightOfferDTO {
    private String id;
    private String airline;
    private String flightNumber;
    private String origin;
    private String destination;
    private String departureTime;
    private String arrivalTime;
    private String duration;
    private int stops;
    private double price;
    private String currency;
    private String cabinClass;
    private int availableSeats;
    private List<String> baggageAllowance;
    private boolean refundable;
}