package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String priority;
    private Boolean isRead;
    private String actionUrl;
    private String imageUrl;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
    private TripBasicResponse trip;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TripBasicResponse {
        private Long id;
        private String title;
        private String destination;
    }
}