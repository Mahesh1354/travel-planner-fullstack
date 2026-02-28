package com.travelplanner.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {

    @NotBlank(message = "Item ID is required")
    private String itemId; // flight ID, accommodation ID, or activity ID

    @NotNull(message = "Booking type is required")
    private String bookingType; // FLIGHT, ACCOMMODATION, ACTIVITY

    private String passengerDetails; // JSON string

    private String paymentInfo; // For mock purposes, just a reference

    private Long tripId; // Optional: link to existing trip

    private Long destinationId; // Optional: link to existing destination

    private String notes;
}