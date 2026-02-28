package com.travelplanner.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "flight_updates")
    private Boolean flightUpdates = true;

    @Column(name = "weather_alerts")
    private Boolean weatherAlerts = true;

    @Column(name = "group_activities")
    private Boolean groupActivities = true;

    @Column(name = "booking_confirmations")
    private Boolean bookingConfirmations = true;

    @Column(name = "payment_reminders")
    private Boolean paymentReminders = true;

    @Column(name = "promotional")
    private Boolean promotional = false;

    @Column(name = "email_enabled")
    private Boolean emailEnabled = true;

    @Column(name = "push_enabled")
    private Boolean pushEnabled = true;

    @Column(name = "sms_enabled")
    private Boolean smsEnabled = false;

    @Column(name = "quiet_hours_start")
    private LocalTime quietHoursStart;

    @Column(name = "quiet_hours_end")
    private LocalTime quietHoursEnd;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}