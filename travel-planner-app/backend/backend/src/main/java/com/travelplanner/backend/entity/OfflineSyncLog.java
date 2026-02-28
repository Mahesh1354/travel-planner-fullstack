package com.travelplanner.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "offline_sync_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfflineSyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_type", nullable = false)
    private SyncType syncType;

    @Column(name = "data_version")
    private Integer dataVersion;

    @Enumerated(EnumType.STRING)
    private SyncStatus status = SyncStatus.SUCCESS;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "sync_started_at")
    private LocalDateTime syncStartedAt;

    @Column(name = "sync_completed_at")
    private LocalDateTime syncCompletedAt;

    @Column(name = "device_info")
    private String deviceInfo;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (syncStartedAt == null) {
            syncStartedAt = LocalDateTime.now();
        }
        if (syncCompletedAt == null && status == SyncStatus.SUCCESS) {
            syncCompletedAt = LocalDateTime.now();
        }
    }

    public enum SyncType {
        DOWNLOAD, UPDATE, DELETE, ACCESS
    }

    public enum SyncStatus {
        SUCCESS, FAILED, IN_PROGRESS
    }
}