package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {
    private Long id;
    private String title;
    private String description;
    private String name;
    private String type;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private BigDecimal cost;
    private String currency;
    private String bookingReference;
    private String notes;
    private String imageUrl;
    private Integer duration;
    private Long destinationId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}