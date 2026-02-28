package com.travelplanner.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetRequest {

    @NotNull(message = "Total budget is required")
    @Positive(message = "Budget must be positive")
    private BigDecimal totalBudget;

    private String currency = "USD";

    private String notes;
}