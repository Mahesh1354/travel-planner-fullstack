package com.travelplanner.backend.controller;

import com.travelplanner.backend.dto.request.RecommendationRequest;
import com.travelplanner.backend.dto.request.UserPreferenceRequest;
import com.travelplanner.backend.dto.response.*;
import com.travelplanner.backend.entity.UserPreference;
import com.travelplanner.backend.service.RecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    // ============== RECOMMENDATIONS ENDPOINTS ==============

    @PostMapping("/places")
    public ResponseEntity<?> getRecommendations(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RecommendationRequest request) {
        try {
            List<RecommendationResponse> recommendations =
                    recommendationService.getRecommendations(userDetails.getUsername(), request);
            return ResponseEntity.ok(recommendations);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/places/search")
    public ResponseEntity<?> searchPlaces(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String location,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<PlaceResponse> places = recommendationService.searchPlaces(
                    userDetails.getUsername(), location, query, limit);
            return ResponseEntity.ok(places);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/places/{placeId}")
    public ResponseEntity<?> getPlaceDetails(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String placeId) {
        try {
            PlaceResponse place = recommendationService.getPlaceDetails(userDetails.getUsername(), placeId);
            return ResponseEntity.ok(place);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== USER PREFERENCES ENDPOINTS ==============

    @GetMapping("/preferences")
    public ResponseEntity<?> getUserPreferences(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            UserPreference preferences = recommendationService.getUserPreferences(userDetails.getUsername());
            return ResponseEntity.ok(preferences);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updateUserPreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserPreferenceRequest request) {
        try {
            UserPreference preferences = recommendationService.updateUserPreferences(
                    userDetails.getUsername(), request);
            return ResponseEntity.ok(preferences);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @DeleteMapping("/preferences")
    public ResponseEntity<?> deleteUserPreferences(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            recommendationService.deleteUserPreferences(userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Preferences deleted successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== TRAVEL TIPS ENDPOINTS ==============

    @GetMapping("/tips")
    public ResponseEntity<?> getTravelTips(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String tipType) {
        try {
            List<TravelTipResponse> tips = recommendationService.getTravelTips(country, city, tipType);
            return ResponseEntity.ok(tips);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/tips/destination/{destination}")
    public ResponseEntity<?> getTipsForDestination(@PathVariable String destination) {
        try {
            List<TravelTipResponse> tips = recommendationService.getTipsForDestination(destination);
            return ResponseEntity.ok(tips);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/tips/{tipId}")
    public ResponseEntity<?> getTipDetails(@PathVariable Long tipId) {
        try {
            TravelTipResponse tip = recommendationService.getTipDetails(tipId);
            return ResponseEntity.ok(tip);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }
}