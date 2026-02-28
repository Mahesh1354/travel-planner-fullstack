package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private Long tripId;
    private String category;
    private String description;
    private BigDecimal estimatedAmount;
    private BigDecimal actualAmount;
    private String currency;
    private LocalDate expenseDate;
    private UserResponse paidBy;
    private String bookingReference;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}