package com.travelplanner.backend.controller;

import com.travelplanner.backend.dto.request.*;
import com.travelplanner.backend.dto.response.JwtResponse;
import com.travelplanner.backend.dto.response.MessageResponse;
import com.travelplanner.backend.dto.response.UserResponse;
import com.travelplanner.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration attempt for email: {}", request.getEmail());
        // Don't log passwords!

        try {
            JwtResponse response = userService.register(request);
            log.info("User registered successfully: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Registration failed for email: {} - {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        try {
            JwtResponse response = userService.login(request);
            log.info("User logged in successfully: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Login failed for email: {} - {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        log.info("Password reset requested for email: {}", request.getEmail());

        try {
            MessageResponse response = userService.requestPasswordReset(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Password reset failed for email: {} - {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordUpdateRequest request) {
        log.info("Password reset attempt");

        try {
            MessageResponse response = userService.updatePassword(request);
            log.info("Password reset successful");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Password reset failed - {}", e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            UserResponse response = userService.getUserProfile(userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Profile fetch failed - {}", e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok(new MessageResponse("Auth endpoints are working!", true));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh attempt");

        try {
            JwtResponse response = userService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        log.info("Logout attempt");

        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                userService.logout(token);
            }
            return ResponseEntity.ok(new MessageResponse("Logged out successfully", true));
        } catch (RuntimeException e) {
            log.error("Logout failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }




    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        log.info("Email verification attempt");

        try {
            MessageResponse response = userService.verifyEmail(token);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Email verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestParam String email) {
        log.info("Resend verification email for: {}", email);

        try {
            MessageResponse response = userService.resendVerificationEmail(email);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Resend verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }
}