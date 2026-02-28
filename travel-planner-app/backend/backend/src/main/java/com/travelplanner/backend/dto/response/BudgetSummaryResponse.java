package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSummaryResponse {
    private Long tripId;
    private String tripTitle;
    private BigDecimal totalBudget;
    private BigDecimal totalEstimated;
    private BigDecimal totalActual;
    private BigDecimal remainingBudget;
    private BigDecimal percentageUsed;
    private Map<String, CategorySummary> categoryBreakdown;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySummary {
        private String category;
        private BigDecimal estimated;
        private BigDecimal actual;
        private BigDecimal difference;
        private int expenseCount;
    }
}