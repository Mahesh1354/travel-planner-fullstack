package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Boolean enabled;
    private Boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Integer totalTrips;
    private Integer totalBookings;
    private String status; // ACTIVE, LOCKED, INACTIVE
}