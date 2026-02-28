package com.travelplanner.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.backend.dto.request.AdminUserUpdateRequest;
import com.travelplanner.backend.dto.response.*;
import com.travelplanner.backend.entity.*;
import com.travelplanner.backend.repository.*;
import com.travelplanner.backend.service.AdminService;
import com.travelplanner.backend.service.BookingService;
import com.travelplanner.backend.service.TripService;
import com.travelplanner.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import java.io.File;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final BookingRepository bookingRepository;
    private final AdminActionLogRepository actionLogRepository;
    private final UserActivitySummaryRepository activitySummaryRepository;
    private final UserService userService;
    private final TripService tripService;
    private final BookingService bookingService;
    private final ObjectMapper objectMapper;
    private final HttpServletRequest httpServletRequest;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::mapToAdminUserResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserResponse getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToAdminUserResponse(user);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUser(String adminEmail, Long userId, AdminUserUpdateRequest request) {
        User admin = userService.getUserByEmail(adminEmail);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update fields if provided
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getRole() != null) {
            user.setRole(User.Role.valueOf(request.getRole()));
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }
        if (request.getEmailVerified() != null) {
            user.setEmailVerified(request.getEmailVerified());
        }

        User updatedUser = userRepository.save(user);

        // Log the action
        logAction(admin, "USER_UPDATE", "USER", userId,
                createDetails("Updated user", request));

        return mapToAdminUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public void lockUser(String adminEmail, Long userId, String reason) {
        User admin = userService.getUserByEmail(adminEmail);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(false);
        userRepository.save(user);

        logAction(admin, "USER_LOCK", "USER", userId,
                createDetails("Locked user", "reason", reason));
    }

    @Override
    @Transactional
    public void unlockUser(String adminEmail, Long userId) {
        User admin = userService.getUserByEmail(adminEmail);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(true);
        userRepository.save(user);

        logAction(admin, "USER_UNLOCK", "USER", userId,
                createDetails("Unlocked user"));
    }

    @Override
    @Transactional
    public void deleteUser(String adminEmail, Long userId) {
        User admin = userService.getUserByEmail(adminEmail);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Log before deletion
        logAction(admin, "USER_DELETE", "USER", userId,
                createDetails("Deleted user"));

        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats(String adminEmail) {
        AdminDashboardResponse response = new AdminDashboardResponse();

        // User stats
        response.setTotalUsers(userRepository.count());

        LocalDateTime today = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
        response.setActiveUsersToday(activitySummaryRepository.countUsersLoggedInSince(today));
        response.setNewUsersToday(userRepository.countByCreatedAtAfter(today));
        response.setLockedUsers(userRepository.countByEnabledFalse());

        // Trip stats - FIXED: Use correct method names
        response.setTotalTrips(tripRepository.count());
        response.setActiveTrips(tripRepository.countByStatus(Trip.TripStatus.PLANNING) +
                tripRepository.countByStatus(Trip.TripStatus.BOOKED));
        response.setCompletedTrips(tripRepository.countByStatus(Trip.TripStatus.COMPLETED));
        response.setSharedTrips(tripRepository.countByIsPublicTrue());

        // Booking stats - FIXED: Use correct method names and enum values
        response.setTotalBookings(bookingRepository.count());
        response.setFlightBookings(bookingRepository.countByBookingType(Booking.BookingType.FLIGHT));
        response.setAccommodationBookings(bookingRepository.countByBookingType(Booking.BookingType.ACCOMMODATION));
        response.setActivityBookings(bookingRepository.countByBookingType(Booking.BookingType.ACTIVITY));

        // Financial stats - FIXED: Handle Optional properly
        response.setTotalBookingValue(bookingRepository.sumTotalPrice().orElse(0.0));
        response.setAverageBookingValue(bookingRepository.averageTotalPrice().orElse(0.0));

        // Recent activity
        response.setRecentActions(getRecentAdminActions(adminEmail, 10));
        response.setRecentUsers(userRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList()));

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminActionLogResponse> getRecentAdminActions(String adminEmail, int limit) {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        return actionLogRepository.findRecentActions(weekAgo)
                .stream()
                .limit(limit)
                .map(this::mapToActionLogResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAnyTrip(String adminEmail, Long tripId, String reason) {
        User admin = userService.getUserByEmail(adminEmail);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        logAction(admin, "TRIP_DELETE", "TRIP", tripId,
                createDetails("Admin deleted trip", "reason", reason,
                        "owner", trip.getUser().getEmail()));

        tripRepository.delete(trip);
    }

    @Override
    @Transactional
    public void cancelAnyBooking(String adminEmail, String bookingReference, String reason) {
        User admin = userService.getUserByEmail(adminEmail);
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);

        logAction(admin, "BOOKING_CANCEL", "BOOKING", booking.getId(),
                createDetails("Admin cancelled booking", "reason", reason,
                        "reference", bookingReference));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminActionLogResponse> getAuditLogs(Pageable pageable, String actionType, Long adminId) {
        // Simplified - in production you'd have a specification for filtering
        return actionLogRepository.findAll(pageable)
                .map(this::mapToActionLogResponse);
    }

    // Helper methods
    private void logAction(User admin, String actionType, String targetType,
                           Long targetId, Map<String, Object> details) {
        AdminActionLog log = new AdminActionLog();
        log.setAdmin(admin);
        log.setActionType(actionType);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setIpAddress(getClientIp());
        log.setUserAgent(httpServletRequest.getHeader("User-Agent"));

        try {
            log.setDetails(objectMapper.writeValueAsString(details));
        } catch (JsonProcessingException e) {
            log.setDetails("{}");
        }

        actionLogRepository.save(log);
    }

    private Map<String, Object> createDetails(String... keyValuePairs) {
        Map<String, Object> details = new HashMap<>();
        for (int i = 0; i < keyValuePairs.length; i += 2) {
            if (i + 1 < keyValuePairs.length) {
                details.put(keyValuePairs[i], keyValuePairs[i + 1]);
            }
        }
        return details;
    }

    private Map<String, Object> createDetails(String message, AdminUserUpdateRequest request) {
        Map<String, Object> details = new HashMap<>();
        details.put("message", message);
        if (request.getReason() != null) {
            details.put("reason", request.getReason());
        }
        return details;
    }

    private String getClientIp() {
        String xfHeader = httpServletRequest.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return httpServletRequest.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole().name());
        response.setEnabled(user.getEnabled());
        response.setEmailVerified(user.getEmailVerified());
        response.setCreatedAt(user.getCreatedAt());

        // Get summary if available
        activitySummaryRepository.findByUser(user).ifPresent(summary -> {
            response.setLastLogin(summary.getLastLogin());
            response.setTotalTrips(summary.getTotalTrips());
            response.setTotalBookings(summary.getTotalBookings());
        });

        // Determine status
        if (!user.getEnabled()) {
            response.setStatus("LOCKED");
        } else if (user.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7))) {
            response.setStatus("NEW");
        } else if (activitySummaryRepository.findByUser(user)
                .map(s -> s.getLastActivity() != null &&
                        s.getLastActivity().isAfter(LocalDateTime.now().minusDays(30)))
                .orElse(false)) {
            response.setStatus("ACTIVE");
        } else {
            response.setStatus("INACTIVE");
        }

        return response;
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getEmailVerified()
        );
    }

    private AdminActionLogResponse mapToActionLogResponse(AdminActionLog log) {
        AdminActionLogResponse response = new AdminActionLogResponse();
        response.setId(log.getId());
        response.setAdminEmail(log.getAdmin().getEmail());
        response.setActionType(log.getActionType());
        response.setTargetType(log.getTargetType());
        response.setTargetId(log.getTargetId());
        response.setDetails(log.getDetails());
        response.setIpAddress(log.getIpAddress());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }
}