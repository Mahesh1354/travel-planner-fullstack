package com.travelplanner.backend.controller;

import com.travelplanner.backend.dto.places.AutocompleteSuggestion;
import com.travelplanner.backend.dto.places.PlaceDTO;
import com.travelplanner.backend.dto.places.PlaceSearchRequest;
import com.travelplanner.backend.dto.response.MessageResponse;
import com.travelplanner.backend.service.PlacesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlacesController {

    private final PlacesService placesService;

    @PostMapping("/search")
    public ResponseEntity<?> searchPlaces(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PlaceSearchRequest request) {
        try {
            List<PlaceDTO> places = placesService.searchPlaces(request);
            return ResponseEntity.ok(places);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/nearby")
    public ResponseEntity<?> searchNearby(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "5000") int radius,
            @RequestParam(required = false) String category) {
        try {
            List<PlaceDTO> places = placesService.searchNearby(lat, lon, radius, category);
            return ResponseEntity.ok(places);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/search/text")
    public ResponseEntity<?> searchByText(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String query,
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<PlaceDTO> places = placesService.searchByText(query, lat, lon, limit);
            return ResponseEntity.ok(places);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<?> autocomplete(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String query,
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            List<AutocompleteSuggestion> suggestions = placesService.autocomplete(query, lat, lon);
            return ResponseEntity.ok(suggestions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/details/{placeId}")
    public ResponseEntity<?> getPlaceDetails(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String placeId) {
        try {
            PlaceDTO place = placesService.getPlaceDetails(placeId);
            return ResponseEntity.ok(place);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getPlaceCategories(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<String> categories = placesService.getPlaceCategories();
            return ResponseEntity.ok(categories);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }
}