package com.travelplanner.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ActivityRequest {

    @NotBlank(message = "Activity name is required")
    @Size(max = 200, message = "Name must be less than 200 characters")
    private String name;

    private String title;
    private String description;

    private String type;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate date;

    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime startTime;

    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime endTime;

    private String location;

    private BigDecimal cost;

    private String currency = "USD";

    private String bookingReference;

    private String notes;

    private String imageUrl;
    private Integer duration;
}