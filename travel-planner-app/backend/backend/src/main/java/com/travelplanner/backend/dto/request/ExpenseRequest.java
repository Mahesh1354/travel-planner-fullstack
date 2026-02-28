package com.travelplanner.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequest {

    @NotNull(message = "Category is required")
    private String category; // FLIGHT, ACCOMMODATION, FOOD, etc.

    @NotBlank(message = "Description is required")
    private String description;

    @Positive(message = "Estimated amount must be positive")
    private BigDecimal estimatedAmount;

    @Positive(message = "Actual amount must be positive")
    private BigDecimal actualAmount;

    private String currency = "USD";

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate expenseDate;

    private Long paidByUserId; // Optional: who paid

    private Long bookingId; // Optional: link to booking

    private String notes;
}