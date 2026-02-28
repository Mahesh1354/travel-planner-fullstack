package com.travelplanner.backend.service;

import com.travelplanner.backend.dto.request.NotificationPreferenceRequest;
import com.travelplanner.backend.dto.request.SendNotificationRequest;
import com.travelplanner.backend.dto.response.NotificationPreferenceResponse;
import com.travelplanner.backend.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface NotificationService {

    // Notification operations
    NotificationResponse sendNotification(SendNotificationRequest request);

    NotificationResponse sendNotificationToUser(Long userId, String type, String title, String message, Long tripId);

    List<NotificationResponse> getUserNotifications(String userEmail);

    Page<NotificationResponse> getUserNotificationsPaginated(String userEmail, Pageable pageable);

    List<NotificationResponse> getUnreadNotifications(String userEmail);

    NotificationResponse getNotification(Long notificationId, String userEmail);

    NotificationResponse markAsRead(Long notificationId, String userEmail);

    List<NotificationResponse> markAllAsRead(String userEmail);

    void deleteNotification(Long notificationId, String userEmail);

    void deleteAllNotifications(String userEmail);

    long getUnreadCount(String userEmail);

    // Preference operations
    NotificationPreferenceResponse getNotificationPreferences(String userEmail);

    NotificationPreferenceResponse updateNotificationPreferences(String userEmail, NotificationPreferenceRequest request);

    // System operations
    void cleanupExpiredNotifications();

}