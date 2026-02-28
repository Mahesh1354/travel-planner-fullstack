package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.SystemMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemMetricRepository extends JpaRepository<SystemMetric, Long> {

    List<SystemMetric> findByMetricNameOrderByRecordedAtDesc(String metricName);

    @Query("SELECT s FROM SystemMetric s WHERE s.metricName = :name AND s.recordedAt >= :since")
    List<SystemMetric> findMetricsSince(@Param("name") String name, @Param("since") LocalDateTime since);

    @Query("SELECT AVG(s.metricValue) FROM SystemMetric s WHERE s.metricName = :name AND s.recordedAt >= :since")
    Double getAverageMetric(@Param("name") String name, @Param("since") LocalDateTime since);

    @Query("SELECT s FROM SystemMetric s WHERE s.recordedAt >= :since ORDER BY s.recordedAt DESC")
    List<SystemMetric> findAllMetricsSince(@Param("since") LocalDateTime since);

    @Query("SELECT DISTINCT s.metricName FROM SystemMetric s")
    List<String> findAllMetricNames();

    @Query("SELECT MAX(s.metricValue) FROM SystemMetric s WHERE s.metricName = :name AND s.recordedAt >= :since")
    Double getMaxMetric(@Param("name") String name, @Param("since") LocalDateTime since);

    @Query("SELECT MIN(s.metricValue) FROM SystemMetric s WHERE s.metricName = :name AND s.recordedAt >= :since")
    Double getMinMetric(@Param("name") String name, @Param("since") LocalDateTime since);
}