package com.travelplanner.backend.service.impl;

import com.travelplanner.backend.client.RecommendationApiClient;
import com.travelplanner.backend.dto.request.RecommendationRequest;
import com.travelplanner.backend.dto.request.UserPreferenceRequest;
import com.travelplanner.backend.dto.response.RecommendationResponse;
import com.travelplanner.backend.dto.response.PlaceResponse;
import com.travelplanner.backend.dto.response.TravelTipResponse;
import com.travelplanner.backend.entity.*;
import com.travelplanner.backend.repository.*;
import com.travelplanner.backend.service.RecommendationService;
import com.travelplanner.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationServiceImpl implements RecommendationService {

    private final RecommendationApiClient recommendationApiClient;
    private final UserPreferenceRepository userPreferenceRepository;
    private final TravelTipRepository travelTipRepository;
    private final UserService userService;

    @Override
    public List<RecommendationResponse> getRecommendations(String userEmail, RecommendationRequest request) {
        log.info("Getting recommendations for user: {} in location: {}", userEmail, request.getLocation());

        // Enhance request with user preferences if userId is not provided
        if (request.getUserId() == null && userEmail != null) {
            User user = userService.getUserByEmail(userEmail);
            UserPreference preferences = userPreferenceRepository.findByUser(user).orElse(null);

            if (preferences != null) {
                if (request.getCategories() == null || request.getCategories().isEmpty()) {
                    request.setCategories(preferences.getPreferredCategories());
                }
                if (request.getBudgetLevel() == null && preferences.getBudgetLevel() != null) {
                    request.setBudgetLevel(preferences.getBudgetLevel().name());
                }
            }
        }

        // Call external API
        return recommendationApiClient.getRecommendations(request);
    }

    @Override
    public List<PlaceResponse> searchPlaces(String userEmail, String location, String query, int limit) {
        log.info("Searching places: {} in {}", query, location);
        return recommendationApiClient.searchPlaces(location, query, limit);
    }

    @Override
    public PlaceResponse getPlaceDetails(String userEmail, String placeId) {
        log.info("Getting place details for ID: {}", placeId);
        return recommendationApiClient.getPlaceDetails(placeId);
    }

    @Override
    @Transactional(readOnly = true)
    public UserPreference getUserPreferences(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        return userPreferenceRepository.findByUser(user)
                .orElseGet(() -> createDefaultPreferences(user));
    }

    @Override
    @Transactional
    public UserPreference updateUserPreferences(String userEmail, UserPreferenceRequest request) {
        User user = userService.getUserByEmail(userEmail);

        UserPreference preferences = userPreferenceRepository.findByUser(user)
                .orElse(new UserPreference());

        preferences.setUser(user);
        preferences.setPreferredCategories(request.getPreferredCategories());

        if (request.getBudgetLevel() != null) {
            preferences.setBudgetLevel(UserPreference.BudgetLevel.valueOf(request.getBudgetLevel()));
        }

        preferences.setDietaryRestrictions(request.getDietaryRestrictions());
        preferences.setInterests(request.getInterests());
        preferences.setAccessibilityNeeds(request.getAccessibilityNeeds());
        preferences.setPreferredLanguage(request.getPreferredLanguage());

        return userPreferenceRepository.save(preferences);
    }

    @Override
    @Transactional
    public void deleteUserPreferences(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        userPreferenceRepository.deleteByUserId(user.getId());
    }

    @Override
    public List<TravelTipResponse> getTravelTips(String country, String city, String tipType) {
        TravelTip.TipType type = tipType != null ? TravelTip.TipType.valueOf(tipType) : null;

        List<TravelTip> tips = travelTipRepository.findTips(country, city, type);

        return tips.stream()
                .filter(tip -> tip.getExpiryDate() == null || tip.getExpiryDate().isAfter(LocalDate.now()))
                .map(this::mapToTravelTipResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TravelTipResponse> getTipsForDestination(String destination) {
        String[] parts = destination.split(",");
        String city = parts[0].trim();
        String country = parts.length > 1 ? parts[1].trim() : null;

        return getTravelTips(country, city, null);
    }

    @Override
    public TravelTipResponse getTipDetails(Long tipId) {
        TravelTip tip = travelTipRepository.findById(tipId)
                .orElseThrow(() -> new RuntimeException("Travel tip not found"));
        return mapToTravelTipResponse(tip);
    }

    private UserPreference createDefaultPreferences(User user) {
        UserPreference preferences = new UserPreference();
        preferences.setUser(user);
        preferences.setBudgetLevel(UserPreference.BudgetLevel.MID_RANGE);
        preferences.setPreferredLanguage("en");
        return userPreferenceRepository.save(preferences);
    }

    private TravelTipResponse mapToTravelTipResponse(TravelTip tip) {
        TravelTipResponse response = new TravelTipResponse();
        response.setId(tip.getId());
        response.setDestinationCountry(tip.getDestinationCountry());
        response.setDestinationCity(tip.getDestinationCity());
        response.setTipType(tip.getTipType().name());
        response.setTitle(tip.getTitle());
        response.setDescription(tip.getDescription());
        response.setSource(tip.getSource());
        response.setIsGovernmentAdvice(tip.getIsGovernmentAdvice());
        response.setLastUpdated(tip.getLastUpdated());
        return response;
    }


}