package com.travelplanner.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "system_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "metric_name", nullable = false, length = 100)
    private String metricName;

    @Column(name = "metric_value", precision = 15, scale = 2)
    private BigDecimal metricValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type")
    private MetricType metricType = MetricType.GAUGE;

    @Column(columnDefinition = "JSON")
    private String tags;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        recordedAt = LocalDateTime.now();
    }

    public enum MetricType {
        GAUGE, COUNTER, HISTOGRAM
    }
}