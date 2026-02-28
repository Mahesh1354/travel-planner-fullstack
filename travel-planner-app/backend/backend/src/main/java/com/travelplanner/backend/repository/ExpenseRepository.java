package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.Expense;
import com.travelplanner.backend.entity.Trip;
import com.travelplanner.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByTripOrderByExpenseDateDesc(Trip trip);

    List<Expense> findByTripIdOrderByExpenseDateDesc(Long tripId);

    List<Expense> findByTripAndCategory(Trip trip, Expense.ExpenseCategory category);

    @Query("SELECT e FROM Expense e WHERE e.trip.id = :tripId AND e.category = :category")
    List<Expense> findByTripIdAndCategory(@Param("tripId") Long tripId, @Param("category") Expense.ExpenseCategory category);

    @Query("SELECT SUM(e.estimatedAmount) FROM Expense e WHERE e.trip.id = :tripId")
    BigDecimal sumEstimatedByTripId(@Param("tripId") Long tripId);

    @Query("SELECT SUM(e.actualAmount) FROM Expense e WHERE e.trip.id = :tripId AND e.actualAmount IS NOT NULL")
    BigDecimal sumActualByTripId(@Param("tripId") Long tripId);

    @Query("SELECT e.category, SUM(e.estimatedAmount), SUM(e.actualAmount), COUNT(e) " +
            "FROM Expense e WHERE e.trip.id = :tripId GROUP BY e.category")
    List<Object[]> getCategorySummary(@Param("tripId") Long tripId);

    List<Expense> findByPaidBy(User user);

    List<Expense> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT e FROM Expense e WHERE e.booking.id = :bookingId")
    List<Expense> findByBookingId(@Param("bookingId") Long bookingId);
}