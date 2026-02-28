package com.travelplanner.backend.entity;

import com.travelplanner.backend.converter.JsonToMapConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Convert(converter = JsonToMapConverter.class)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> metadata;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum NotificationType {
        FLIGHT_UPDATE, WEATHER_ALERT, GROUP_ACTIVITY, BOOKING_CONFIRMATION, PAYMENT_REMINDER, GENERAL
    }

    public enum Priority {
        HIGH, MEDIUM, LOW
    }
}