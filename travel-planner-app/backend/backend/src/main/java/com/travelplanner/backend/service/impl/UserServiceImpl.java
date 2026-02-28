package com.travelplanner.backend.service.impl;

import com.travelplanner.backend.dto.request.LoginRequest;
import com.travelplanner.backend.dto.request.PasswordResetRequest;
import com.travelplanner.backend.dto.request.PasswordUpdateRequest;
import com.travelplanner.backend.dto.request.RegisterRequest;
import com.travelplanner.backend.dto.response.JwtResponse;
import com.travelplanner.backend.dto.response.MessageResponse;
import com.travelplanner.backend.dto.response.UserResponse;
import com.travelplanner.backend.entity.User;
import com.travelplanner.backend.repository.UserRepository;
import com.travelplanner.backend.security.JwtUtils;
import com.travelplanner.backend.service.EmailService;
import com.travelplanner.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;


import jakarta.mail.MessagingException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;
    private final Map<String, String> refreshTokens = new java.util.concurrent.ConcurrentHashMap<>();

    @Value("${app.base-url}")
    private String baseUrl;


    @Override
    @Transactional
    public MessageResponse requestPasswordReset(PasswordResetRequest request) {
        log.info("Password reset requested for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));

        userRepository.save(user);

        // Send email with reset token
        try {
            emailService.sendPasswordResetEmail(user, resetToken);
            log.info("Password reset email sent to: {}", user.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send password reset email: {}", e.getMessage());
            throw new RuntimeException("Failed to send password reset email. Please try again.");
        }

        return new MessageResponse("Password reset email sent successfully");
    }

    @Override
    @Transactional
    public MessageResponse updatePassword(PasswordUpdateRequest request) {
        log.info("Password update attempt with token");

        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        // Check if token is expired
        if (user.getResetTokenExpiry() == null ||
                user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        log.info("Password updated successfully for user: {}", user.getEmail());

        return new MessageResponse("Password updated successfully");
    }

    @Override
    public UserResponse getUserProfile(String email) {
        log.info("Fetching profile for user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getEmailVerified()
        );
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Override
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    @Override
    public JwtResponse refreshToken(String refreshToken) {
        log.info("Attempting to refresh token");

        // Validate refresh token exists in our store
        if (!refreshTokens.containsKey(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String email = refreshTokens.get(refreshToken);

        // Validate the token itself
        if (!jwtUtils.validateRefreshToken(refreshToken)) {
            refreshTokens.remove(refreshToken);
            throw new RuntimeException("Refresh token expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate new tokens
        String newAccessToken = jwtUtils.generateToken(user.getEmail());
        String newRefreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        // Remove old refresh token and store new one
        refreshTokens.remove(refreshToken);
        refreshTokens.put(newRefreshToken, user.getEmail());

        log.info("Token refreshed successfully for user: {}", email);

        return new JwtResponse(
                newAccessToken,
                newRefreshToken,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name()
        );
    }

    @Override
    public void logout(String token) {
        // Remove refresh token if it exists
        refreshTokens.remove(token);
        log.info("User logged out");
    }


    @Override
    @Transactional
    public JwtResponse register(RegisterRequest request) {
        log.info("Attempting to register user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed - email already in use: {}", request.getEmail());
            throw new RuntimeException("Email already in use");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(User.Role.USER);
        user.setEmailVerified(false);

        // Generate verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));

        User savedUser = userRepository.save(user);
        log.info("User saved to database with ID: {}", savedUser.getId());

        // Send verification email
        try {
            String verificationLink = baseUrl + "/verify-email?token=" + verificationToken;
            emailService.sendVerificationEmail(savedUser, verificationLink);
            log.info("Verification email sent to: {}", savedUser.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send verification email: {}", e.getMessage());
            // Don't throw exception - user can still register, just can't verify yet
        }

        // Generate both tokens
        String accessToken = jwtUtils.generateToken(savedUser.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(savedUser.getEmail());

        // Store refresh token
        refreshTokens.put(refreshToken, savedUser.getEmail());

        return new JwtResponse(
                accessToken,
                refreshToken,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getRole().name()
        );
    }

    // ADD this new method
    @Override
    @Transactional
    public MessageResponse verifyEmail(String token) {
        log.info("Verifying email with token: {}", token);

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        // Check if token is expired
        if (user.getVerificationTokenExpiry() == null ||
                user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired. Please request a new one.");
        }

        // Check if already verified
        if (user.getEmailVerified()) {
            return new MessageResponse("Email already verified. You can login now.", true);
        }

        // Verify email
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);

        log.info("Email verified successfully for user: {}", user.getEmail());

        return new MessageResponse("Email verified successfully! You can now login.", true);
    }

    // ADD this new method
    @Override
    @Transactional
    public MessageResponse resendVerificationEmail(String email) {
        log.info("Resending verification email to: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Check if already verified
        if (user.getEmailVerified()) {
            return new MessageResponse("Email is already verified.", true);
        }

        // Generate new verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        // Send verification email
        try {
            String verificationLink = baseUrl + "/verify-email?token=" + verificationToken;
            emailService.sendVerificationEmail(user, verificationLink);
            log.info("Verification email resent to: {}", user.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send verification email: {}", e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again.");
        }

        return new MessageResponse("Verification email sent successfully. Please check your inbox.", true);
    }

    // MODIFY login method to check verification (optional)
    @Override
    public JwtResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Optional: Check if email is verified
            // Uncomment the following lines if you want to enforce email verification
        /*
        if (!user.getEmailVerified()) {
            throw new RuntimeException("Please verify your email before logging in. Check your inbox for the verification link.");
        }
        */

            // Generate both tokens
            String accessToken = jwtUtils.generateToken(request.getEmail());
            String refreshToken = jwtUtils.generateRefreshToken(request.getEmail());

            // Store refresh token (remove old ones for this user)
            refreshTokens.entrySet().removeIf(entry -> entry.getValue().equals(user.getEmail()));
            refreshTokens.put(refreshToken, user.getEmail());

            log.info("User logged in successfully: {}", user.getEmail());

            return new JwtResponse(
                    accessToken,
                    refreshToken,
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole().name()
            );

        } catch (BadCredentialsException e) {
            log.warn("Login failed - invalid credentials for email: {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }
    }
}