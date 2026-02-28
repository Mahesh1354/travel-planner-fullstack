package com.travelplanner.backend.controller;

import com.travelplanner.backend.dto.response.MessageResponse;
import com.travelplanner.backend.entity.User;
import com.travelplanner.backend.service.EmailService;
import com.travelplanner.backend.service.UserService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailService emailService;
    private final UserService userService;

    @PostMapping("/test/welcome")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testWelcomeEmail(@RequestParam String email) {
        try {
            User user = userService.getUserByEmail(email);
            emailService.sendWelcomeEmail(user);
            return ResponseEntity.ok(new MessageResponse("Test welcome email sent successfully", true));
        } catch (MessagingException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to send email: " + e.getMessage(), false));
        }
    }

    @PostMapping("/test/reset")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testResetEmail(@RequestParam String email) {
        try {
            User user = userService.getUserByEmail(email);
            emailService.sendPasswordResetEmail(user, "test-token-123");
            return ResponseEntity.ok(new MessageResponse("Test password reset email sent successfully", true));
        } catch (MessagingException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to send email: " + e.getMessage(), false));
        }
    }
}