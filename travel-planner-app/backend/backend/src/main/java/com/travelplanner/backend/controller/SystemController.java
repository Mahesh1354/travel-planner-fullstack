package com.travelplanner.backend.controller;

import com.travelplanner.backend.dto.response.MessageResponse;
import com.travelplanner.backend.dto.response.SystemHealthResponse;
import com.travelplanner.backend.dto.response.SystemMetricResponse;
import com.travelplanner.backend.service.SystemMonitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
public class SystemController {

    private final SystemMonitorService systemMonitorService;

    @GetMapping("/health")
    public ResponseEntity<?> getSystemHealth() {
        try {
            SystemHealthResponse health = systemMonitorService.getSystemHealth();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return ResponseEntity.status(503).body(new MessageResponse("System health check failed", false));
        }
    }

    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMetrics(
            @RequestParam(required = false) String metricName,
            @RequestParam(defaultValue = "1h") String timeRange) {
        try {
            List<SystemMetricResponse> metrics = systemMonitorService.getMetrics(metricName, timeRange);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSystemStats() {
        try {
            Map<String, Object> stats = systemMonitorService.getSystemStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/api-performance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getApiPerformance() {
        try {
            Map<String, Double> performance = systemMonitorService.getApiPerformanceStats();
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/database-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDatabaseStats() {
        try {
            Map<String, Object> stats = systemMonitorService.getDatabaseStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/metrics/record")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> recordMetric(
            @RequestParam String name,
            @RequestParam Double value,
            @RequestParam(defaultValue = "GAUGE") String type) {
        try {
            systemMonitorService.recordMetric(name, value, type);
            return ResponseEntity.ok(new MessageResponse("Metric recorded successfully", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }
}