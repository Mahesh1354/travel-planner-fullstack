package com.travelplanner.backend.entity;

import com.travelplanner.backend.converter.JsonToStringArrayConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Convert(converter = JsonToStringArrayConverter.class)
    @Column(name = "preferred_categories", columnDefinition = "JSON")
    private List<String> preferredCategories;

    @Enumerated(EnumType.STRING)
    @Column(name = "budget_level")
    private BudgetLevel budgetLevel = BudgetLevel.MID_RANGE;

    @Convert(converter = JsonToStringArrayConverter.class)
    @Column(name = "dietary_restrictions", columnDefinition = "JSON")
    private List<String> dietaryRestrictions;

    @Convert(converter = JsonToStringArrayConverter.class)
    @Column(name = "interests", columnDefinition = "JSON")
    private List<String> interests;

    @Column(name = "accessibility_needs")
    private Boolean accessibilityNeeds = false;

    @Column(name = "preferred_language", length = 10)
    private String preferredLanguage = "en";

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

    public enum BudgetLevel {
        BUDGET, MID_RANGE, LUXURY
    }
}