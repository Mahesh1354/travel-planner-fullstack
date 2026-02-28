package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.Trip;
import com.travelplanner.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByUserOrderByStartDateDesc(User user);

    @Query("SELECT t FROM Trip t WHERE t.user = :user OR " +
            "EXISTS (SELECT tc FROM TripCollaborator tc WHERE tc.trip = t AND tc.user = :user AND tc.status = 'ACCEPTED')")
    List<Trip> findAllAccessibleTrips(@Param("user") User user);

    @Query("SELECT t FROM Trip t WHERE t.isPublic = true AND t.startDate >= :startDate")
    List<Trip> findPublicTrips(@Param("startDate") LocalDate startDate);

    @Query("SELECT t FROM Trip t WHERE t.user = :user AND t.status = :status")
    List<Trip> findByUserAndStatus(@Param("user") User user, @Param("status") Trip.TripStatus status);

    boolean existsByIdAndUser(Long id, User user);

    // Admin dashboard methods
    @Query("SELECT COUNT(t) FROM Trip t WHERE t.status = :status")
    long countByStatus(@Param("status") Trip.TripStatus status);

    @Query("SELECT COUNT(t) FROM Trip t WHERE t.isPublic = true")
    long countByIsPublicTrue();

    @Query("SELECT DATE(t.createdAt), COUNT(t) FROM Trip t WHERE t.createdAt >= :since GROUP BY DATE(t.createdAt)")
    List<Object[]> getTripCreationStats(@Param("since") LocalDateTime since);

    @Query("SELECT t.status, COUNT(t) FROM Trip t GROUP BY t.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT AVG(DATEDIFF(t.endDate, t.startDate)) FROM Trip t")
    Double getAverageTripDuration();

    List<Trip> findByIsPublicTrueAndStatusNot(Trip.TripStatus status);
}