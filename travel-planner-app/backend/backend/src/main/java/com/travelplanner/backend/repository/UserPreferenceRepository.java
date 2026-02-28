package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.User;
import com.travelplanner.backend.entity.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {

    Optional<UserPreference> findByUser(User user);

    Optional<UserPreference> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}