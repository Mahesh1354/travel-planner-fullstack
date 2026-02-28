package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String refreshToken;  // ADD THIS FIELD
    private String type = "Bearer";
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;

    public JwtResponse(String token, String refreshToken, Long id, String email,
                       String firstName, String lastName, String role) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.type = "Bearer";
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    public JwtResponse(String token, Long id, String email,
                       String firstName, String lastName, String role) {
        this(token, null, id, email, firstName, lastName, role);
    }
}