package com.travelplanner.backend.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class UserPreferenceRequest {

    private List<String> preferredCategories;

    private String budgetLevel;

    private List<String> dietaryRestrictions;

    private List<String> interests;

    private Boolean accessibilityNeeds;

    private String preferredLanguage;
}