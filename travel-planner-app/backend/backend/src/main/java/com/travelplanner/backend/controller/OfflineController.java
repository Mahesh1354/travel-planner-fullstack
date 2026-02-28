package com.travelplanner.backend.controller;

import com.travelplanner.backend.dto.request.OfflineSyncRequest;
import com.travelplanner.backend.dto.response.*;
import com.travelplanner.backend.service.OfflineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/offline")
@RequiredArgsConstructor
public class OfflineController {

    private final OfflineService offlineService;

    // ============== DOWNLOAD ENDPOINTS ==============

    @PostMapping("/download")
    public ResponseEntity<?> downloadTripsForOffline(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OfflineSyncRequest request) {
        try {
            OfflineSyncResponse response = offlineService.downloadTripsForOffline(
                    userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/download/{tripId}")
    public ResponseEntity<?> downloadSingleTrip(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId,
            @RequestParam(required = false, defaultValue = "false") Boolean forceRefresh) {
        try {
            OfflineDataResponse response = offlineService.downloadSingleTrip(
                    userDetails.getUsername(), tripId, forceRefresh);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== ACCESS ENDPOINTS ==============

    @GetMapping("/trips")
    public ResponseEntity<?> getAllOfflineTrips(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<OfflineDataResponse> trips = offlineService.getAllOfflineTrips(userDetails.getUsername());
            return ResponseEntity.ok(trips);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<?> getOfflineTripData(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            OfflineDataResponse data = offlineService.getOfflineTripData(userDetails.getUsername(), tripId);
            return ResponseEntity.ok(data);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getOfflineStatus(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            OfflineStatusResponse status = offlineService.getOfflineStatus(userDetails.getUsername());
            return ResponseEntity.ok(status);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/validate/{tripId}")
    public ResponseEntity<?> validateOfflineData(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            boolean isValid = offlineService.isOfflineDataValid(userDetails.getUsername(), tripId);
            return ResponseEntity.ok(new MessageResponse("Offline data valid: " + isValid, isValid));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== UPDATE ENDPOINTS ==============

    @PostMapping("/refresh/{tripId}")
    public ResponseEntity<?> refreshOfflineData(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            OfflineDataResponse response = offlineService.refreshOfflineData(userDetails.getUsername(), tripId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/refresh-all")
    public ResponseEntity<?> refreshAllOfflineData(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            OfflineSyncResponse response = offlineService.refreshAllOfflineData(userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== DELETE ENDPOINTS ==============

    @DeleteMapping("/trip/{tripId}")
    public ResponseEntity<?> deleteOfflineData(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            offlineService.deleteOfflineData(userDetails.getUsername(), tripId);
            return ResponseEntity.ok(new MessageResponse("Offline data deleted successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllOfflineData(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            offlineService.deleteAllOfflineData(userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("All offline data deleted successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @DeleteMapping("/expired")
    public ResponseEntity<?> deleteExpiredOfflineData(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            offlineService.deleteExpiredOfflineData(userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Expired offline data deleted successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }
}