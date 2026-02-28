package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminActionLogResponse {
    private Long id;
    private String adminEmail;
    private String actionType;
    private String targetType;
    private Long targetId;
    private String details;
    private String ipAddress;
    private LocalDateTime createdAt;
}