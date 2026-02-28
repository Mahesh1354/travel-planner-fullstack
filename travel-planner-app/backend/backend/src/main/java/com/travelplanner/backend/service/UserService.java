package com.travelplanner.backend.service;

import com.travelplanner.backend.dto.request.LoginRequest;
import com.travelplanner.backend.dto.request.PasswordResetRequest;
import com.travelplanner.backend.dto.request.PasswordUpdateRequest;
import com.travelplanner.backend.dto.request.RegisterRequest;
import com.travelplanner.backend.dto.response.JwtResponse;
import com.travelplanner.backend.dto.response.MessageResponse;
import com.travelplanner.backend.dto.response.UserResponse;
import com.travelplanner.backend.entity.User;

public interface UserService {
    JwtResponse register(RegisterRequest request);
    JwtResponse login(LoginRequest request);
    MessageResponse requestPasswordReset(PasswordResetRequest request);
    MessageResponse updatePassword(PasswordUpdateRequest request);
    UserResponse getUserProfile(String email);
    User getUserByEmail(String email);
    User getUserById(Long userId);
    JwtResponse refreshToken(String refreshToken);
    void logout(String token);

    MessageResponse verifyEmail(String token);
    MessageResponse resendVerificationEmail(String email);
}