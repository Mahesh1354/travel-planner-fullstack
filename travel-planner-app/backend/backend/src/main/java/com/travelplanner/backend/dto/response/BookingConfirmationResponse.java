package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingConfirmationResponse {

    private String bookingReference;
    private String status; // CONFIRMED, PENDING, FAILED, CANCELLED
    private String provider;
    private Map<String, Object> bookingDetails;
    private double totalPrice;
    private String currency;
    private LocalDateTime bookedAt;
    private String cancellationPolicy;
    private String additionalInfo;
}