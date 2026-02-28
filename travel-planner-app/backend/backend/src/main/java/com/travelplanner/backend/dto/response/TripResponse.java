package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Double budget;
    private String currency;
    private String coverImage;
    private Long ownerId;
    private String ownerName;
    private Boolean isPublic;
    private UserResponse owner;
    private List<DestinationResponse> destinations;
    private List<CollaboratorResponse> collaborators;
    private List<BookingDTO> bookings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer destinationCount;
    private Integer activityCount;
    private boolean isOwner;
    private String permission; // OWNER, EDITOR, VIEWER
}