package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.Budget;
import com.travelplanner.backend.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Optional<Budget> findByTrip(Trip trip);

    Optional<Budget> findByTripId(Long tripId);

    @Query("SELECT b FROM Budget b WHERE b.trip.id = :tripId")
    Optional<Budget> findByTripIdOptimized(@Param("tripId") Long tripId);

    boolean existsByTripId(Long tripId);

    void deleteByTripId(Long tripId);
}