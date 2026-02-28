package com.travelplanner.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_activity_summary")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserActivitySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "total_logins")
    private Integer totalLogins = 0;

    @Column(name = "total_trips")
    private Integer totalTrips = 0;

    @Column(name = "total_bookings")
    private Integer totalBookings = 0;

    @Column(name = "total_expenses", precision = 15, scale = 2)
    private BigDecimal totalExpenses = BigDecimal.ZERO;

    @Column(name = "last_activity")
    private LocalDateTime lastActivity;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}