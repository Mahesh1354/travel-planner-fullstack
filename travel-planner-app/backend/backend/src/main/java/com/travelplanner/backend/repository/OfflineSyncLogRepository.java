package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.OfflineSyncLog;
import com.travelplanner.backend.entity.Trip;
import com.travelplanner.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OfflineSyncLogRepository extends JpaRepository<OfflineSyncLog, Long> {

    List<OfflineSyncLog> findByUserOrderBySyncStartedAtDesc(User user);

    List<OfflineSyncLog> findByUserAndTripOrderBySyncStartedAtDesc(User user, Trip trip);

    @Query("SELECT l FROM OfflineSyncLog l WHERE l.user = :user AND l.syncStartedAt >= :since")
    List<OfflineSyncLog> findRecentByUser(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT l FROM OfflineSyncLog l WHERE l.status = 'FAILED' AND l.syncStartedAt >= :since")
    List<OfflineSyncLog> findRecentFailures(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(l) FROM OfflineSyncLog l WHERE l.user = :user AND l.syncType = 'DOWNLOAD' AND l.status = 'SUCCESS'")
    long countSuccessfulDownloads(@Param("user") User user);
}