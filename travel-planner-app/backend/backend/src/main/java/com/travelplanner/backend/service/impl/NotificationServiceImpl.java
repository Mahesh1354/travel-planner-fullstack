package com.travelplanner.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.backend.dto.request.NotificationPreferenceRequest;
import com.travelplanner.backend.dto.request.SendNotificationRequest;
import com.travelplanner.backend.dto.response.NotificationPreferenceResponse;
import com.travelplanner.backend.dto.response.NotificationResponse;
import com.travelplanner.backend.entity.*;
import com.travelplanner.backend.repository.*;
import com.travelplanner.backend.service.NotificationService;
import com.travelplanner.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserService userService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public NotificationResponse sendNotification(SendNotificationRequest request) {
        User user = userService.getUserById(request.getUserId());

        // Check user preferences before sending
        NotificationPreference preferences = getPreferencesEntity(user);
        if (!shouldSendNotification(preferences, request.getType())) {
            log.info("Notification suppressed due to user preferences for user: {}", user.getEmail());
            return null;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(Notification.NotificationType.valueOf(request.getType()));
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setPriority(Notification.Priority.valueOf(request.getPriority()));
        notification.setActionUrl(request.getActionUrl());
        notification.setImageUrl(request.getImageUrl());

        // Set expiration (7 days from now)
        notification.setExpiresAt(LocalDateTime.now().plusDays(7));

        Notification savedNotification = notificationRepository.save(notification);

        // Trigger delivery based on preferences
        triggerDelivery(savedNotification, preferences);

        return mapToNotificationResponse(savedNotification);
    }

    @Override
    @Transactional
    public NotificationResponse sendNotificationToUser(Long userId, String type, String title, String message, Long tripId) {
        SendNotificationRequest request = new SendNotificationRequest();
        request.setUserId(userId);
        request.setType(type);
        request.setTitle(title);
        request.setMessage(message);
        request.setTripId(tripId);
        request.setPriority("MEDIUM");

        return sendNotification(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToNotificationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotificationsPaginated(String userEmail, Pageable pageable) {
        User user = userService.getUserByEmail(userEmail);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToNotificationResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToNotificationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotification(Long notificationId, String userEmail) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You don't have access to this notification");
        }

        return mapToNotificationResponse(notification);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, String userEmail) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You don't have access to this notification");
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());

        Notification updatedNotification = notificationRepository.save(notification);
        return mapToNotificationResponse(updatedNotification);
    }

    @Override
    @Transactional
    public List<NotificationResponse> markAllAsRead(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        notificationRepository.markAllAsRead(user, LocalDateTime.now());
        return getUserNotifications(userEmail);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, String userEmail) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You don't have access to this notification");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void deleteAllNotifications(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notificationRepository.deleteAll(notifications);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        return notificationRepository.countUnreadByUser(user);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationPreferenceResponse getNotificationPreferences(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        NotificationPreference preferences = getPreferencesEntity(user);
        return mapToPreferenceResponse(preferences);
    }

    @Override
    @Transactional
    public NotificationPreferenceResponse updateNotificationPreferences(String userEmail, NotificationPreferenceRequest request) {
        User user = userService.getUserByEmail(userEmail);

        NotificationPreference preferences = preferenceRepository.findByUser(user)
                .orElse(new NotificationPreference());

        preferences.setUser(user);

        if (request.getFlightUpdates() != null) preferences.setFlightUpdates(request.getFlightUpdates());
        if (request.getWeatherAlerts() != null) preferences.setWeatherAlerts(request.getWeatherAlerts());
        if (request.getGroupActivities() != null) preferences.setGroupActivities(request.getGroupActivities());
        if (request.getBookingConfirmations() != null) preferences.setBookingConfirmations(request.getBookingConfirmations());
        if (request.getPaymentReminders() != null) preferences.setPaymentReminders(request.getPaymentReminders());
        if (request.getPromotional() != null) preferences.setPromotional(request.getPromotional());
        if (request.getEmailEnabled() != null) preferences.setEmailEnabled(request.getEmailEnabled());
        if (request.getPushEnabled() != null) preferences.setPushEnabled(request.getPushEnabled());
        if (request.getSmsEnabled() != null) preferences.setSmsEnabled(request.getSmsEnabled());
        if (request.getQuietHoursStart() != null) preferences.setQuietHoursStart(request.getQuietHoursStart());
        if (request.getQuietHoursEnd() != null) preferences.setQuietHoursEnd(request.getQuietHoursEnd());

        NotificationPreference savedPreferences = preferenceRepository.save(preferences);
        return mapToPreferenceResponse(savedPreferences);
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM daily
    public void cleanupExpiredNotifications() {
        log.info("Running cleanup of expired notifications");
        int deletedCount = notificationRepository.deleteExpired(LocalDateTime.now());
        log.info("Deleted {} expired notifications", deletedCount);
    }

    // Helper methods
    private NotificationPreference getPreferencesEntity(User user) {
        return preferenceRepository.findByUser(user)
                .orElseGet(() -> {
                    NotificationPreference defaultPrefs = new NotificationPreference();
                    defaultPrefs.setUser(user);
                    return preferenceRepository.save(defaultPrefs);
                });
    }

    private boolean shouldSendNotification(NotificationPreference preferences, String type) {
        if (preferences == null) return true;

        switch (type) {
            case "FLIGHT_UPDATE":
                return preferences.getFlightUpdates();
            case "WEATHER_ALERT":
                return preferences.getWeatherAlerts();
            case "GROUP_ACTIVITY":
                return preferences.getGroupActivities();
            case "BOOKING_CONFIRMATION":
                return preferences.getBookingConfirmations();
            case "PAYMENT_REMINDER":
                return preferences.getPaymentReminders();
            case "PROMOTIONAL":
                return preferences.getPromotional();
            default:
                return true;
        }
    }

    private void triggerDelivery(Notification notification, NotificationPreference preferences) {
        log.info("Notification delivered to user: {}", notification.getUser().getEmail());
    }

    private NotificationResponse mapToNotificationResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setType(notification.getType().name());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setPriority(notification.getPriority().name());
        response.setIsRead(notification.getIsRead());
        response.setActionUrl(notification.getActionUrl());
        response.setImageUrl(notification.getImageUrl());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }

    private NotificationPreferenceResponse mapToPreferenceResponse(NotificationPreference preferences) {
        NotificationPreferenceResponse response = new NotificationPreferenceResponse();
        response.setId(preferences.getId());
        response.setFlightUpdates(preferences.getFlightUpdates());
        response.setWeatherAlerts(preferences.getWeatherAlerts());
        response.setGroupActivities(preferences.getGroupActivities());
        response.setBookingConfirmations(preferences.getBookingConfirmations());
        response.setPaymentReminders(preferences.getPaymentReminders());
        response.setPromotional(preferences.getPromotional());
        response.setEmailEnabled(preferences.getEmailEnabled());
        response.setPushEnabled(preferences.getPushEnabled());
        response.setSmsEnabled(preferences.getSmsEnabled());
        response.setQuietHoursStart(preferences.getQuietHoursStart());
        response.setQuietHoursEnd(preferences.getQuietHoursEnd());
        return response;
    }
}