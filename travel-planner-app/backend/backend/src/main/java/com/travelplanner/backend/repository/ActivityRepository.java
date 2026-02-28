package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.Activity;
import com.travelplanner.backend.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByDestinationOrderByDateAscStartTimeAsc(Destination destination);

    List<Activity> findByDestinationAndDate(Destination destination, LocalDate date);

    void deleteByDestination(Destination destination);
}