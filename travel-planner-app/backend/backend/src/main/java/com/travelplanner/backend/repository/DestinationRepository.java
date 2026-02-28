package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.Destination;
import com.travelplanner.backend.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, Long> {

    List<Destination> findByTripOrderByArrivalDateAsc(Trip trip);


    void deleteByTrip(Trip trip);
}