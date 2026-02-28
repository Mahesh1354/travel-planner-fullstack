package com.travelplanner.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.List;

@Data
public class AccommodationSearchRequest {

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Check-in date is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate checkIn;

    @NotNull(message = "Check-out date is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate checkOut;

    @Min(value = 1, message = "At least 1 guest")
    private int guests = 2;

    private int rooms = 1;

    private Double minPrice;

    private Double maxPrice;

    private List<String> amenities;

    private Double minRating;

    private String currency = "USD";
}