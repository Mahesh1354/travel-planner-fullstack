package com.travelplanner.backend.controller;

import com.travelplanner.backend.dto.request.NotificationPreferenceRequest;
import com.travelplanner.backend.dto.response.MessageResponse;
import com.travelplanner.backend.dto.response.NotificationPreferenceResponse;
import com.travelplanner.backend.dto.response.NotificationResponse;
import com.travelplanner.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // ============== NOTIFICATION ENDPOINTS ==============

    @GetMapping
    public ResponseEntity<?> getUserNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<NotificationResponse> notifications =
                    notificationService.getUserNotificationsPaginated(userDetails.getUsername(), pageable);
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<NotificationResponse> notifications =
                    notificationService.getUnreadNotifications(userDetails.getUsername());
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            long count = notificationService.getUnreadCount(userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Unread count: " + count, true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/{notificationId}")
    public ResponseEntity<?> getNotification(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long notificationId) {
        try {
            NotificationResponse notification =
                    notificationService.getNotification(notificationId, userDetails.getUsername());
            return ResponseEntity.ok(notification);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long notificationId) {
        try {
            NotificationResponse notification =
                    notificationService.markAsRead(notificationId, userDetails.getUsername());
            return ResponseEntity.ok(notification);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<NotificationResponse> notifications =
                    notificationService.markAllAsRead(userDetails.getUsername());
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long notificationId) {
        try {
            notificationService.deleteNotification(notificationId, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Notification deleted successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            notificationService.deleteAllNotifications(userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("All notifications deleted successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== PREFERENCE ENDPOINTS ==============

    @GetMapping("/preferences")
    public ResponseEntity<?> getNotificationPreferences(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            NotificationPreferenceResponse preferences =
                    notificationService.getNotificationPreferences(userDetails.getUsername());
            return ResponseEntity.ok(preferences);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updateNotificationPreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody NotificationPreferenceRequest request) {
        try {
            NotificationPreferenceResponse preferences =
                    notificationService.updateNotificationPreferences(userDetails.getUsername(), request);
            return ResponseEntity.ok(preferences);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }
}