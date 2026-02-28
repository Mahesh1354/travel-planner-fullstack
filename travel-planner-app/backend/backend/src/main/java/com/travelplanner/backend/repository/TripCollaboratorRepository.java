package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.Trip;
import com.travelplanner.backend.entity.TripCollaborator;
import com.travelplanner.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripCollaboratorRepository extends JpaRepository<TripCollaborator, Long> {

    List<TripCollaborator> findByTrip(Trip trip);

    List<TripCollaborator> findByUserAndStatus(User user, TripCollaborator.InvitationStatus status);

    Optional<TripCollaborator> findByTripAndUser(Trip trip, User user);

    boolean existsByTripAndUser(Trip trip, User user);

    void deleteByTrip(Trip trip);
}