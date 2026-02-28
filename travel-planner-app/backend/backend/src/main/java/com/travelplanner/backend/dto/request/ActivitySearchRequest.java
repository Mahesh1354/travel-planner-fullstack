package com.travelplanner.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.List;

@Data
public class ActivitySearchRequest {

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Date is required")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate date;

    private List<String> types;

    @Min(value = 1, message = "At least 1 participant")
    private int participants = 2;

    private Double maxPrice;

    private String currency = "USD";
}