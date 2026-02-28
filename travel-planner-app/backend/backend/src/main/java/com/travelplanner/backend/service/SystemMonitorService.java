package com.travelplanner.backend.service;

import com.travelplanner.backend.dto.response.SystemHealthResponse;
import com.travelplanner.backend.dto.response.SystemMetricResponse;
import java.util.List;
import java.util.Map;

public interface SystemMonitorService {

    SystemHealthResponse getSystemHealth();

    List<SystemMetricResponse> getMetrics(String metricName, String timeRange);

    Map<String, Object> getSystemStats();

    void recordMetric(String metricName, Double value, String type);

    Map<String, Double> getApiPerformanceStats();

    Map<String, Object> getDatabaseStats();

    void checkExternalServices();
}