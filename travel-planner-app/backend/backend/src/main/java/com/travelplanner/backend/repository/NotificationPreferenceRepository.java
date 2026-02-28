package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.NotificationPreference;
import com.travelplanner.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    Optional<NotificationPreference> findByUser(User user);

    Optional<NotificationPreference> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}