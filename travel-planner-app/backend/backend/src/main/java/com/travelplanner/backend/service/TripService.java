package com.travelplanner.backend.service;

import com.travelplanner.backend.dto.request.*;
import com.travelplanner.backend.dto.response.TripResponse;
import com.travelplanner.backend.dto.response.DestinationResponse;
import com.travelplanner.backend.dto.response.ActivityResponse;
import com.travelplanner.backend.dto.response.CollaboratorResponse;
import com.travelplanner.backend.entity.Trip;
import java.util.List;

public interface TripService {

    // Trip operations
    TripResponse createTrip(String userEmail, TripRequest request);
    TripResponse getTrip(Long tripId, String userEmail);
    List<TripResponse> getUserTrips(String userEmail);
    TripResponse updateTrip(Long tripId, String userEmail, TripRequest request);
    void deleteTrip(Long tripId, String userEmail);
    TripResponse duplicateTrip(Long tripId, String userEmail);

    // Destination operations
    DestinationResponse addDestination(Long tripId, String userEmail, DestinationRequest request);
    DestinationResponse updateDestination(Long destinationId, String userEmail, DestinationRequest request);
    void removeDestination(Long destinationId, String userEmail);
    List<DestinationResponse> getTripDestinations(Long tripId, String userEmail);

    // Activity operations
    ActivityResponse addActivity(Long destinationId, String userEmail, ActivityRequest request);
    ActivityResponse updateActivity(Long activityId, String userEmail, ActivityRequest request);
    void removeActivity(Long activityId, String userEmail);
    List<ActivityResponse> getDestinationActivities(Long destinationId, String userEmail);

    // Sharing operations
    CollaboratorResponse shareTrip(Long tripId, String ownerEmail, ShareTripRequest request);
    List<CollaboratorResponse> getTripCollaborators(Long tripId, String userEmail);
    void removeCollaborator(Long tripId, Long collaboratorId, String userEmail);
    CollaboratorResponse respondToInvitation(Long invitationId, String userEmail, boolean accept);
    List<TripResponse> getSharedTrips(String userEmail);

    // Helper method
    Trip getTripEntity(Long tripId, String userEmail);

    // Add this method to the TripService interface
    TripResponse addBookingToTrip(Long tripId, String userEmail, String bookingReference);
}