package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.User;
import com.travelplanner.backend.entity.UserActivitySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserActivitySummaryRepository extends JpaRepository<UserActivitySummary, Long> {

    Optional<UserActivitySummary> findByUser(User user);

    Optional<UserActivitySummary> findByUserId(Long userId);

    @Query("SELECT u FROM UserActivitySummary u WHERE u.lastActivity >= :since")
    List<UserActivitySummary> findActiveUsers(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(u) FROM UserActivitySummary u WHERE u.lastLogin >= :since")
    long countUsersLoggedInSince(@Param("since") LocalDateTime since);

    @Modifying
    @Query("UPDATE UserActivitySummary u SET u.totalLogins = u.totalLogins + 1, u.lastLogin = :now WHERE u.user = :user")
    void updateLoginStats(@Param("user") User user, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE UserActivitySummary u SET u.totalTrips = u.totalTrips + 1 WHERE u.user = :user")
    void incrementTripCount(@Param("user") User user);

    @Modifying
    @Query("UPDATE UserActivitySummary u SET u.totalBookings = u.totalBookings + 1 WHERE u.user = :user")
    void incrementBookingCount(@Param("user") User user);

    @Modifying
    @Query("UPDATE UserActivitySummary u SET u.totalExpenses = u.totalExpenses + :amount WHERE u.user = :user")
    void addExpense(@Param("user") User user, @Param("amount") Double amount);

    @Modifying
    @Query("UPDATE UserActivitySummary u SET u.lastActivity = :now WHERE u.user = :user")
    void updateLastActivity(@Param("user") User user, @Param("now") LocalDateTime now);
}