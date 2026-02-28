package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthResponse {
    private String status; // UP, DOWN, DEGRADED
    private String database;
    private String diskSpace;
    private Double uptime;
    private Integer activeSessions;
    private Double averageResponseTime;
    private Double errorRate;
    private Integer totalRequests;
    private Map<String, String> services; // External API statuses
    private Map<String, Object> details;
}