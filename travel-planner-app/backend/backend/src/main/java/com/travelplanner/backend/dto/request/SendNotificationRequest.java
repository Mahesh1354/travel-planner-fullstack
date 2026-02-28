package com.travelplanner.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.Map;

@Data
public class SendNotificationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    private Long tripId;

    @NotBlank(message = "Notification type is required")
    private String type;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    private String priority = "MEDIUM";

    private String actionUrl;

    private String imageUrl;

    private Map<String, Object> metadata;
}