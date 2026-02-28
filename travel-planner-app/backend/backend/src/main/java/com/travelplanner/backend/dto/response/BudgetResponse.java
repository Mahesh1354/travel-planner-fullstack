package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private Long tripId;
    private String tripTitle;
    private BigDecimal totalBudget;
    private String currency;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}