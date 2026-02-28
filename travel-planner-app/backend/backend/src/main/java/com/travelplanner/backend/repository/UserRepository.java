package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    Boolean existsByEmail(String email);

    // Add these methods to your existing UserRepository interface

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    long countByCreatedAtAfter(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(u) FROM User u WHERE u.enabled = false")
    long countByEnabledFalse();

    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC")
    List<User> findTop10ByOrderByCreatedAtDesc(Pageable pageable);

    default List<User> findTop10ByOrderByCreatedAtDesc() {
        return findTop10ByOrderByCreatedAtDesc(Pageable.ofSize(10));
    }

    @Query("SELECT DATE(u.createdAt), COUNT(u) FROM User u WHERE u.createdAt >= :since GROUP BY DATE(u.createdAt)")
    List<Object[]> getUserGrowthStats(@Param("since") LocalDateTime since);

    @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
    List<Object[]> countByRole();

    Optional<User> findByVerificationToken(String verificationToken);
}