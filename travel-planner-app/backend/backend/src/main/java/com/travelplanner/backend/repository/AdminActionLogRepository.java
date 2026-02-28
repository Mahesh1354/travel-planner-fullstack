package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.AdminActionLog;
import com.travelplanner.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, Long> {

    List<AdminActionLog> findByAdminOrderByCreatedAtDesc(User admin);

    Page<AdminActionLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT a FROM AdminActionLog a WHERE a.createdAt >= :since ORDER BY a.createdAt DESC")
    List<AdminActionLog> findRecentActions(@Param("since") LocalDateTime since);

    @Query("SELECT a FROM AdminActionLog a WHERE a.targetType = :targetType AND a.targetId = :targetId ORDER BY a.createdAt DESC")
    List<AdminActionLog> findByTarget(@Param("targetType") String targetType, @Param("targetId") Long targetId);

    @Query("SELECT COUNT(a) FROM AdminActionLog a WHERE a.admin = :admin AND a.createdAt >= :since")
    long countActionsByAdmin(@Param("admin") User admin, @Param("since") LocalDateTime since);

    @Query("SELECT a.actionType, COUNT(a) FROM AdminActionLog a WHERE a.createdAt >= :since GROUP BY a.actionType")
    List<Object[]> getActionTypeStats(@Param("since") LocalDateTime since);

    @Query("SELECT DATE(a.createdAt), COUNT(a) FROM AdminActionLog a WHERE a.createdAt >= :since GROUP BY DATE(a.createdAt)")
    List<Object[]> getDailyActionStats(@Param("since") LocalDateTime since);
}