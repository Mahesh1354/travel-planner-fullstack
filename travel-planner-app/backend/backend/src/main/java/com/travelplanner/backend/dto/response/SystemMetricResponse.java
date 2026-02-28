package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemMetricResponse {
    private String metricName;
    private BigDecimal value;
    private String type;
    private LocalDateTime timestamp;
}