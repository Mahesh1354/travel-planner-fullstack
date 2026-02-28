package com.travelplanner.backend.repository;

import com.travelplanner.backend.entity.Notification;
import com.travelplanner.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.createdAt >= :since")
    List<Notification> findRecentByUser(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.type = :type")
    List<Notification> findByUserAndType(@Param("user") User user, @Param("type") Notification.NotificationType type);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.isRead = false")
    long countUnreadByUser(@Param("user") User user);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :now WHERE n.user = :user AND n.isRead = false")
    int markAllAsRead(@Param("user") User user, @Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.expiresAt < :now")
    int deleteExpired(@Param("now") LocalDateTime now);
}