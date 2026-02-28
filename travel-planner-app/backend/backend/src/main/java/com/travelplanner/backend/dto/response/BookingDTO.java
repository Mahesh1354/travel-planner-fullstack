package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private String bookingReference;
    private String bookingType;
    private String provider;
    private String status;
    private BigDecimal totalPrice;
    private String currency;
    private LocalDateTime bookedAt;
    private LocalDateTime cancelledAt;
    private Long userId;
    private String userEmail;
    private String userFirstName;
    private String userLastName;
    private Long tripId;
    private String tripTitle;
    private Long destinationId;
    private String destinationName;
    private Long activityId;
    private String activityName;
}