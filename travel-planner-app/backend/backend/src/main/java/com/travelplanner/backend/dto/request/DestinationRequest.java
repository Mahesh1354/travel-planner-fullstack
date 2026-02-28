package com.travelplanner.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@Data
public class DestinationRequest {

    @NotBlank(message = "Destination name is required")
    @Size(max = 200, message = "Name must be less than 200 characters")
    private String name;

    private String country;

    private String city;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate arrivalDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate departureDate;

    @Size(max = 200, message = "Accommodation name must be less than 200 characters")
    private String accommodationName;

    private String accommodationAddress;

    private String accommodationConfirmation;

    private Double latitude;  // Added

    private Double longitude; // Added

    private String notes;

    private String placeId;
}