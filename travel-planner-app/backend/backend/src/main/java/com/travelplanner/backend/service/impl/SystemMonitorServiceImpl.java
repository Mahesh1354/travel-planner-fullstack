package com.travelplanner.backend.service.impl;

import com.travelplanner.backend.dto.response.SystemHealthResponse;
import com.travelplanner.backend.dto.response.SystemMetricResponse;
import com.travelplanner.backend.entity.SystemMetric;
import com.travelplanner.backend.repository.SystemMetricRepository;
import com.travelplanner.backend.service.SystemMonitorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.io.File;
import java.lang.management.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemMonitorServiceImpl implements SystemMonitorService {

    private final SystemMetricRepository metricRepository;
    private final OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
    private final MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
    private final Map<String, List<Long>> apiResponseTimes = new HashMap<>();
    private final Map<String, Integer> apiErrorCounts = new HashMap<>();

    @Override
    public SystemHealthResponse getSystemHealth() {
        SystemHealthResponse response = new SystemHealthResponse();

        // Check database
        try {
            metricRepository.count();
            response.setDatabase("UP");
        } catch (Exception e) {
            response.setDatabase("DOWN");
        }

        // Check disk space
        File root = new File("/");
        long freeSpace = root.getFreeSpace();
        long totalSpace = root.getTotalSpace();
        double freePercent = (freeSpace * 100.0) / totalSpace;

        response.setDiskSpace(String.format("%.2f GB free / %.2f GB total (%.1f%%)",
                freeSpace / 1e9, totalSpace / 1e9, freePercent));

        // Uptime
        long uptime = ManagementFactory.getRuntimeMXBean().getUptime();
        response.setUptime(uptime / 1000.0 / 60); // minutes

        // Active sessions (simplified)
        response.setActiveSessions(1);

        // Average response time
        response.setAverageResponseTime(calculateAverageResponseTime());

        // Error rate
        response.setErrorRate(calculateErrorRate());

        // Total requests
        response.setTotalRequests(getTotalRequests());

        // External services status
        Map<String, String> services = new HashMap<>();
        services.put("Flight API", checkExternalService("flight"));
        services.put("Accommodation API", checkExternalService("accommodation"));
        services.put("Activity API", checkExternalService("activity"));
        services.put("Weather API", checkExternalService("weather"));
        response.setServices(services);

        // Overall status
        boolean allUp = services.values().stream().allMatch("UP"::equals) &&
                response.getDatabase().equals("UP");
        response.setStatus(allUp ? "UP" : "DEGRADED");

        // Details
        Map<String, Object> details = new HashMap<>();
        details.put("memory", String.format("%.2f MB / %.2f MB",
                memoryBean.getHeapMemoryUsage().getUsed() / 1e6,
                memoryBean.getHeapMemoryUsage().getMax() / 1e6));
        details.put("cpu", osBean.getSystemLoadAverage());
        details.put("threads", ManagementFactory.getThreadMXBean().getThreadCount());
        response.setDetails(details);

        return response;
    }

    @Override
    public List<SystemMetricResponse> getMetrics(String metricName, String timeRange) {
        LocalDateTime since = parseTimeRange(timeRange);

        List<SystemMetric> metrics;
        if (metricName != null && !metricName.isEmpty()) {
            metrics = metricRepository.findMetricsSince(metricName, since);
        } else {
            metrics = metricRepository.findAllMetricsSince(since);
        }

        return metrics.stream()
                .map(this::mapToMetricResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        // CPU stats
        stats.put("cpu_load", osBean.getSystemLoadAverage());
        stats.put("available_processors", osBean.getAvailableProcessors());

        // Memory stats - FIXED: Convert to double properly
        stats.put("heap_memory_used", memoryBean.getHeapMemoryUsage().getUsed() / 1e6);
        stats.put("heap_memory_max", memoryBean.getHeapMemoryUsage().getMax() / 1e6);
        stats.put("non_heap_memory_used", memoryBean.getNonHeapMemoryUsage().getUsed() / 1e6);

        // Thread stats
        stats.put("thread_count", ManagementFactory.getThreadMXBean().getThreadCount());
        stats.put("daemon_thread_count", ManagementFactory.getThreadMXBean().getDaemonThreadCount());

        // Class loading stats
        stats.put("total_loaded_classes", ManagementFactory.getClassLoadingMXBean().getTotalLoadedClassCount());
        stats.put("active_loaded_classes", ManagementFactory.getClassLoadingMXBean().getLoadedClassCount());

        return stats;
    }

    @Override
    public void recordMetric(String metricName, Double value, String type) {
        SystemMetric metric = new SystemMetric();
        metric.setMetricName(metricName);
        metric.setMetricValue(BigDecimal.valueOf(value)); // FIXED: Convert double to BigDecimal
        metric.setMetricType(SystemMetric.MetricType.valueOf(type));
        metric.setRecordedAt(LocalDateTime.now());

        metricRepository.save(metric);
    }

    @Override
    public Map<String, Double> getApiPerformanceStats() {
        Map<String, Double> stats = new HashMap<>();

        for (Map.Entry<String, List<Long>> entry : apiResponseTimes.entrySet()) {
            List<Long> times = entry.getValue();
            if (!times.isEmpty()) {
                double avg = times.stream().mapToLong(Long::longValue).average().orElse(0);
                stats.put(entry.getKey() + "_avg_ms", avg);
                stats.put(entry.getKey() + "_max_ms", times.stream().max(Long::compare).orElse(0L).doubleValue());
                stats.put(entry.getKey() + "_min_ms", times.stream().min(Long::compare).orElse(0L).doubleValue());
                stats.put(entry.getKey() + "_count", (double) times.size());
            }
        }

        // Error rates
        for (Map.Entry<String, Integer> entry : apiErrorCounts.entrySet()) {
            stats.put(entry.getKey() + "_errors", entry.getValue().doubleValue());
        }

        return stats;
    }

    @Override
    public Map<String, Object> getDatabaseStats() {
        Map<String, Object> stats = new HashMap<>();

        // Get database connection pool stats (simplified)
        stats.put("active_connections", 1);
        stats.put("max_connections", 10);
        stats.put("idle_connections", 9);

        // Get query stats (would need actual implementation)
        stats.put("total_queries", metricRepository.count());
        stats.put("slow_queries", 0);

        return stats;
    }

    @Override
    public void checkExternalServices() {
        // In a real implementation, this would ping external APIs
        log.info("Checking external services health");
    }

    // Helper methods for recording API performance
    public void recordApiCall(String apiName, long responseTimeMs, boolean success) {
        apiResponseTimes.computeIfAbsent(apiName, k -> new ArrayList<>()).add(responseTimeMs);

        // Keep only last 1000 records
        List<Long> times = apiResponseTimes.get(apiName);
        if (times.size() > 1000) {
            times.remove(0);
        }

        if (!success) {
            apiErrorCounts.put(apiName, apiErrorCounts.getOrDefault(apiName, 0) + 1);
        }
    }

    private double calculateAverageResponseTime() {
        List<Long> allTimes = apiResponseTimes.values().stream()
                .flatMap(List::stream)
                .collect(Collectors.toList());

        if (allTimes.isEmpty()) {
            return 0.0;
        }

        return allTimes.stream().mapToLong(Long::longValue).average().orElse(0);
    }

    private double calculateErrorRate() {
        int totalErrors = apiErrorCounts.values().stream().mapToInt(Integer::intValue).sum();
        int totalCalls = apiResponseTimes.values().stream().mapToInt(List::size).sum();

        if (totalCalls == 0) {
            return 0.0;
        }

        return (totalErrors * 100.0) / totalCalls;
    }

    private int getTotalRequests() {
        return apiResponseTimes.values().stream().mapToInt(List::size).sum();
    }

    private String checkExternalService(String service) {
        // Mock implementation - in production, actually check the service
        return Math.random() > 0.1 ? "UP" : "DOWN";
    }

    private LocalDateTime parseTimeRange(String timeRange) {
        if (timeRange == null) return LocalDateTime.now().minusHours(1);

        switch (timeRange) {
            case "1h": return LocalDateTime.now().minusHours(1);
            case "24h": return LocalDateTime.now().minusHours(24);
            case "7d": return LocalDateTime.now().minusDays(7);
            case "30d": return LocalDateTime.now().minusDays(30);
            default: return LocalDateTime.now().minusHours(1);
        }
    }

    private SystemMetricResponse mapToMetricResponse(SystemMetric metric) {
        SystemMetricResponse response = new SystemMetricResponse();
        response.setMetricName(metric.getMetricName());
        response.setValue(metric.getMetricValue()); //
        response.setType(metric.getMetricType().name());
        response.setTimestamp(metric.getRecordedAt());
        return response;
    }

}