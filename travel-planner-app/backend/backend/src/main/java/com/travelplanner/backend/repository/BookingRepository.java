package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.Booking;
import com.travelplanner.backend.entity.Trip;
import com.travelplanner.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByUserOrderByBookedAtDesc(User user);

    List<Booking> findByTrip(Trip trip);

    @Query("SELECT b FROM Booking b WHERE b.trip.id = :tripId")
    List<Booking> findByTripId(@Param("tripId") Long tripId);

    @Query("SELECT b FROM Booking b WHERE b.user = :user AND b.bookingType = :type")
    List<Booking> findByUserAndBookingType(@Param("user") User user, @Param("type") Booking.BookingType bookingType);

    @Query("SELECT b FROM Booking b WHERE b.destination.id = :destinationId")
    List<Booking> findByDestinationId(@Param("destinationId") Long destinationId);

    @Query("SELECT b FROM Booking b WHERE b.activity.id = :activityId")
    List<Booking> findByActivityId(@Param("activityId") Long activityId);

    boolean existsByBookingReference(String bookingReference);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.bookingReference = :ref AND b.user = :user")
    boolean existsByBookingReferenceAndUser(@Param("ref") String bookingReference, @Param("user") User user);

    // Admin dashboard methods
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingType = :type")
    long countByBookingType(@Param("type") Booking.BookingType type);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b")
    Optional<Double> sumTotalPrice();

    @Query("SELECT AVG(b.totalPrice) FROM Booking b")
    Optional<Double> averageTotalPrice();

    @Query("SELECT DATE(b.bookedAt), COUNT(b), SUM(b.totalPrice) FROM Booking b WHERE b.bookedAt >= :since GROUP BY DATE(b.bookedAt)")
    List<Object[]> getBookingStats(@Param("since") LocalDateTime since);

    @Query("SELECT b.bookingType, COUNT(b), SUM(b.totalPrice) FROM Booking b WHERE b.bookedAt >= :since GROUP BY b.bookingType")
    List<Object[]> getBookingTypeStats(@Param("since") LocalDateTime since);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.bookedAt >= :since")
    Optional<Double> sumTotalPriceSince(@Param("since") LocalDateTime since);
}