package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.OfflineData;
import com.travelplanner.backend.entity.Trip;
import com.travelplanner.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OfflineDataRepository extends JpaRepository<OfflineData, Long> {

    Optional<OfflineData> findByUserAndTrip(User user, Trip trip);

    Optional<OfflineData> findByUserIdAndTripId(Long userId, Long tripId);

    List<OfflineData> findByUser(User user);

    List<OfflineData> findByUserAndExpiresAtAfter(User user, LocalDateTime date);

    @Query("SELECT o FROM OfflineData o WHERE o.user = :user AND o.expiresAt < :now")
    List<OfflineData> findExpiredByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    @Query("SELECT o FROM OfflineData o WHERE o.expiresAt < :now")
    List<OfflineData> findAllExpired(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(o) FROM OfflineData o WHERE o.user = :user")
    long countByUser(@Param("user") User user);

    @Query("SELECT SUM(o.fileSize) FROM OfflineData o WHERE o.user = :user")
    Long sumFileSizeByUser(@Param("user") User user);

    boolean existsByUserAndTrip(User user, Trip trip);

    @Modifying
    @Query("DELETE FROM OfflineData o WHERE o.expiresAt < :now")
    int deleteAllExpired(@Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM OfflineData o WHERE o.user = :user AND o.trip.id IN :tripIds")
    int deleteByUserAndTripIds(@Param("user") User user, @Param("tripIds") List<Long> tripIds);
}