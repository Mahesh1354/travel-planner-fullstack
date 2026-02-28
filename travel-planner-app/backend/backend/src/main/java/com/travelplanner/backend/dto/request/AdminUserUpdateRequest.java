package com.travelplanner.backend.dto.request;

import lombok.Data;
import jakarta.validation.constraints.Email;

@Data
public class AdminUserUpdateRequest {

    @Email(message = "Invalid email format")
    private String email;

    private String firstName;

    private String lastName;

    private String role; // USER, ADMIN

    private Boolean enabled;

    private Boolean emailVerified;

    private String action; // LOCK, UNLOCK, RESET_PASSWORD, etc.

    private String reason;
}