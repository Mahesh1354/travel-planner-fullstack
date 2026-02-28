package com.travelplanner.backend.controller;

import com.travelplanner.backend.dto.request.AdminUserUpdateRequest;
import com.travelplanner.backend.dto.response.*;
import com.travelplanner.backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ============== DASHBOARD ==============

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            AdminDashboardResponse dashboard = adminService.getDashboardStats(userDetails.getUsername());
            return ResponseEntity.ok(dashboard);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== USER MANAGEMENT ==============

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
            Page<AdminUserResponse> users = adminService.getAllUsers(pageable);
            return ResponseEntity.ok(users);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserDetails(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {
        try {
            AdminUserResponse user = adminService.getUserDetails(userId);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId,
            @Valid @RequestBody AdminUserUpdateRequest request) {
        try {
            AdminUserResponse user = adminService.updateUser(userDetails.getUsername(), userId, request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/users/{userId}/lock")
    public ResponseEntity<?> lockUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId,
            @RequestParam String reason) {
        try {
            adminService.lockUser(userDetails.getUsername(), userId, reason);
            return ResponseEntity.ok(new MessageResponse("User locked successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/users/{userId}/unlock")
    public ResponseEntity<?> unlockUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {
        try {
            adminService.unlockUser(userDetails.getUsername(), userId);
            return ResponseEntity.ok(new MessageResponse("User unlocked successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {
        try {
            adminService.deleteUser(userDetails.getUsername(), userId);
            return ResponseEntity.ok(new MessageResponse("User deleted successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== TRIP MANAGEMENT ==============

    @DeleteMapping("/trips/{tripId}")
    public ResponseEntity<?> deleteTrip(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId,
            @RequestParam String reason) {
        try {
            adminService.deleteAnyTrip(userDetails.getUsername(), tripId, reason);
            return ResponseEntity.ok(new MessageResponse("Trip deleted successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== BOOKING MANAGEMENT ==============

    @PostMapping("/bookings/{bookingReference}/cancel")
    public ResponseEntity<?> cancelBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String bookingReference,
            @RequestParam String reason) {
        try {
            adminService.cancelAnyBooking(userDetails.getUsername(), bookingReference, reason);
            return ResponseEntity.ok(new MessageResponse("Booking cancelled successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== AUDIT LOGS ==============

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) Long adminId) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<AdminActionLogResponse> logs = adminService.getAuditLogs(pageable, actionType, adminId);
            return ResponseEntity.ok(logs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }
}