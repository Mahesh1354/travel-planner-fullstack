package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CollaboratorResponse {
    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String profilePicture;
    private UserResponse user;
    private String permissionLevel;
    private String status;
    private UserResponse invitedBy;
    private LocalDateTime invitedAt;
    private LocalDateTime respondedAt;
}