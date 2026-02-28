package com.travelplanner.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "travel_tips")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TravelTip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "destination_country", nullable = false, length = 100)
    private String destinationCountry;

    @Column(name = "destination_city", length = 100)
    private String destinationCity;

    @Enumerated(EnumType.STRING)
    @Column(name = "tip_type", nullable = false)
    private TipType tipType;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    private String source;

    @Column(name = "is_government_advice")
    private Boolean isGovernmentAdvice = false;

    @Column(name = "last_updated")
    private LocalDate lastUpdated;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (lastUpdated == null) {
            lastUpdated = LocalDate.now();
        }
    }

    public enum TipType {
        VISA, SAFETY, HEALTH, CULTURE, TRANSPORT, WEATHER, GENERAL
    }
}