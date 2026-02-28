package com.travelplanner.backend.service.impl;

import com.travelplanner.backend.dto.request.*;
import com.travelplanner.backend.dto.response.*;
import com.travelplanner.backend.entity.*;
import com.travelplanner.backend.event.ActivityEvent;
import com.travelplanner.backend.repository.*;
import com.travelplanner.backend.service.EmailService;
import com.travelplanner.backend.service.TripService;
import com.travelplanner.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;
    private final ActivityRepository activityRepository;
    private final TripCollaboratorRepository collaboratorRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final EmailService emailService;
    // private final BookingRepository bookingRepository; // Add this if needed

    @Override
    @Transactional
    public TripResponse createTrip(String userEmail, TripRequest request) {
        User user = userService.getUserByEmail(userEmail);

        Trip trip = new Trip();
        trip.setUser(user);
        trip.setTitle(request.getTitle());
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setCoverImage(request.getCoverImage());
        trip.setIsPublic(request.getIsPublic());
        trip.setStatus(Trip.TripStatus.PLANNING); // FIXED: Add status

        Trip savedTrip = tripRepository.save(trip);
        return mapToTripResponse(savedTrip);
    }

    @Override
    @Transactional(readOnly = true)
    public TripResponse getTrip(Long tripId, String userEmail) {
        Trip trip = getTripEntity(tripId, userEmail);
        return mapToTripResponse(trip);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripResponse> getUserTrips(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        return tripRepository.findByUserOrderByStartDateDesc(user)
                .stream()
                .map(this::mapToTripResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TripResponse updateTrip(Long tripId, String userEmail, TripRequest request) {
        Trip trip = getTripEntity(tripId, userEmail);

        if (!hasEditPermission(trip, userEmail)) {
            throw new RuntimeException("You don't have permission to edit this trip");
        }

        trip.setTitle(request.getTitle());
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setCoverImage(request.getCoverImage());
        trip.setIsPublic(request.getIsPublic());

        Trip updatedTrip = tripRepository.save(trip);
        return mapToTripResponse(updatedTrip);
    }

    @Override
    @Transactional
    public void deleteTrip(Long tripId, String userEmail) {
        Trip trip = getTripEntity(tripId, userEmail);

        if (!trip.getUser().getEmail().equals(userEmail) && !isAdminCollaborator(trip, userEmail)) {
            throw new RuntimeException("Only the trip owner or admin collaborators can delete the trip");
        }

        tripRepository.delete(trip);
    }

    @Override
    @Transactional
    public TripResponse duplicateTrip(Long tripId, String userEmail) {
        Trip originalTrip = getTripEntity(tripId, userEmail);
        User user = userService.getUserByEmail(userEmail);

        Trip newTrip = new Trip();
        newTrip.setUser(user);
        newTrip.setTitle(originalTrip.getTitle() + " (Copy)");
        newTrip.setDescription(originalTrip.getDescription());
        newTrip.setStartDate(originalTrip.getStartDate());
        newTrip.setEndDate(originalTrip.getEndDate());
        newTrip.setCoverImage(originalTrip.getCoverImage());
        newTrip.setIsPublic(false);
        newTrip.setStatus(Trip.TripStatus.PLANNING);

        Trip savedTrip = tripRepository.save(newTrip);

        for (Destination dest : originalTrip.getDestinations()) {
            Destination newDest = new Destination();
            newDest.setTrip(savedTrip);
            newDest.setName(dest.getName());
            newDest.setCountry(dest.getCountry());
            newDest.setCity(dest.getCity());
            newDest.setArrivalDate(dest.getArrivalDate());
            newDest.setDepartureDate(dest.getDepartureDate());
            newDest.setAccommodationName(dest.getAccommodationName());
            newDest.setAccommodationAddress(dest.getAccommodationAddress());
            newDest.setAccommodationConfirmation(dest.getAccommodationConfirmation());
            newDest.setNotes(dest.getNotes());
            newDest.setLatitude(dest.getLatitude());
            newDest.setLongitude(dest.getLongitude());

            Destination savedDest = destinationRepository.save(newDest);

            for (Activity act : dest.getActivities()) {
                Activity newAct = new Activity();
                newAct.setDestination(savedDest);
                newAct.setName(act.getName());
                newAct.setType(act.getType());
                newAct.setDate(act.getDate());
                newAct.setStartTime(act.getStartTime());
                newAct.setEndTime(act.getEndTime());
                newAct.setLocation(act.getLocation());
                newAct.setCost(act.getCost());
                newAct.setCurrency(act.getCurrency());
                newAct.setBookingReference(act.getBookingReference());
                newAct.setNotes(act.getNotes());

                activityRepository.save(newAct);
            }
        }

        return mapToTripResponse(savedTrip);
    }

    @Override
    @Transactional
    public DestinationResponse addDestination(Long tripId, String userEmail, DestinationRequest request) {
        Trip trip = getTripEntity(tripId, userEmail);

        if (!hasEditPermission(trip, userEmail)) {
            throw new RuntimeException("You don't have permission to add destinations to this trip");
        }

        Destination destination = new Destination();
        destination.setTrip(trip);
        destination.setName(request.getName());
        destination.setCountry(request.getCountry());
        destination.setCity(request.getCity());
        destination.setArrivalDate(request.getArrivalDate());
        destination.setDepartureDate(request.getDepartureDate());
        destination.setAccommodationName(request.getAccommodationName());
        destination.setAccommodationAddress(request.getAccommodationAddress());
        destination.setAccommodationConfirmation(request.getAccommodationConfirmation());
        destination.setNotes(request.getNotes());

        if (request.getLatitude() != null) {
            destination.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            destination.setLongitude(request.getLongitude());
        }

        Destination savedDestination = destinationRepository.save(destination);
        return mapToDestinationResponse(savedDestination);
    }

    @Override
    @Transactional
    public DestinationResponse updateDestination(Long destinationId, String userEmail, DestinationRequest request) {
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        if (!hasEditPermission(destination.getTrip(), userEmail)) {
            throw new RuntimeException("You don't have permission to update this destination");
        }

        destination.setName(request.getName());
        destination.setCountry(request.getCountry());
        destination.setCity(request.getCity());
        destination.setArrivalDate(request.getArrivalDate());
        destination.setDepartureDate(request.getDepartureDate());
        destination.setAccommodationName(request.getAccommodationName());
        destination.setAccommodationAddress(request.getAccommodationAddress());
        destination.setAccommodationConfirmation(request.getAccommodationConfirmation());
        destination.setNotes(request.getNotes());

        if (request.getLatitude() != null) {
            destination.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            destination.setLongitude(request.getLongitude());
        }

        Destination updatedDestination = destinationRepository.save(destination);
        return mapToDestinationResponse(updatedDestination);
    }

    @Override
    @Transactional
    public void removeDestination(Long destinationId, String userEmail) {
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        if (!hasEditPermission(destination.getTrip(), userEmail)) {
            throw new RuntimeException("You don't have permission to remove this destination");
        }

        destinationRepository.delete(destination);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DestinationResponse> getTripDestinations(Long tripId, String userEmail) {
        Trip trip = getTripEntity(tripId, userEmail);
        return destinationRepository.findByTripOrderByArrivalDateAsc(trip)
                .stream()
                .map(this::mapToDestinationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ActivityResponse addActivity(Long destinationId, String userEmail, ActivityRequest request) {
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        if (!hasEditPermission(destination.getTrip(), userEmail)) {
            throw new RuntimeException("You don't have permission to add activities to this destination");
        }

        Activity activity = new Activity();
        activity.setDestination(destination);
        activity.setName(request.getName());

        // FIXED: Handle invalid enum values
        try {
            activity.setType(Activity.ActivityType.valueOf(request.getType()));
        } catch (IllegalArgumentException e) {
            activity.setType(Activity.ActivityType.OTHER);
            log.warn("Invalid activity type: {}, defaulting to OTHER", request.getType());
        }

        activity.setDate(request.getDate());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setLocation(request.getLocation());
        activity.setCost(request.getCost());
        activity.setCurrency(request.getCurrency());
        activity.setBookingReference(request.getBookingReference());
        activity.setNotes(request.getNotes());

        Activity savedActivity = activityRepository.save(activity);

        eventPublisher.publishEvent(new ActivityEvent(
                this,
                destination.getTrip().getId(),
                savedActivity.getName(),
                userEmail,
                userEmail,
                ActivityEvent.EventType.ADDED
        ));

        return mapToActivityResponse(savedActivity);
    }

    @Override
    @Transactional
    public ActivityResponse updateActivity(Long activityId, String userEmail, ActivityRequest request) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        if (!hasEditPermission(activity.getDestination().getTrip(), userEmail)) {
            throw new RuntimeException("You don't have permission to update this activity");
        }

        String oldName = activity.getName();

        activity.setName(request.getName());

        // FIXED: Handle invalid enum values
        try {
            activity.setType(Activity.ActivityType.valueOf(request.getType()));
        } catch (IllegalArgumentException e) {
            activity.setType(Activity.ActivityType.OTHER);
            log.warn("Invalid activity type: {}, defaulting to OTHER", request.getType());
        }

        activity.setDate(request.getDate());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setLocation(request.getLocation());
        activity.setCost(request.getCost());
        activity.setCurrency(request.getCurrency());
        activity.setBookingReference(request.getBookingReference());
        activity.setNotes(request.getNotes());

        Activity updatedActivity = activityRepository.save(activity);

        if (!oldName.equals(request.getName())) {
            eventPublisher.publishEvent(new ActivityEvent(
                    this,
                    activity.getDestination().getTrip().getId(),
                    updatedActivity.getName(),
                    userEmail,
                    userEmail,
                    ActivityEvent.EventType.UPDATED
            ));
        }

        return mapToActivityResponse(updatedActivity);
    }

    @Override
    @Transactional
    public void removeActivity(Long activityId, String userEmail) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        if (!hasEditPermission(activity.getDestination().getTrip(), userEmail)) {
            throw new RuntimeException("You don't have permission to remove this activity");
        }

        activityRepository.delete(activity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityResponse> getDestinationActivities(Long destinationId, String userEmail) {
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        getTripEntity(destination.getTrip().getId(), userEmail);

        return activityRepository.findByDestinationOrderByDateAscStartTimeAsc(destination)
                .stream()
                .map(this::mapToActivityResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CollaboratorResponse shareTrip(Long tripId, String ownerEmail, ShareTripRequest request) {
        Trip trip = getTripEntity(tripId, ownerEmail);

        if (!trip.getUser().getEmail().equals(ownerEmail) && !isAdminCollaborator(trip, ownerEmail)) {
            throw new RuntimeException("Only the trip owner or admin collaborators can share this trip");
        }

        User userToShare = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        if (collaboratorRepository.existsByTripAndUser(trip, userToShare)) {
            throw new RuntimeException("Trip already shared with this user");
        }

        User owner = userService.getUserByEmail(ownerEmail);

        TripCollaborator collaborator = new TripCollaborator();
        collaborator.setTrip(trip);
        collaborator.setUser(userToShare);
        collaborator.setPermissionLevel(TripCollaborator.PermissionLevel.valueOf(request.getPermissionLevel()));
        collaborator.setInvitedBy(owner);
        collaborator.setStatus(TripCollaborator.InvitationStatus.PENDING);

        TripCollaborator savedCollaborator = collaboratorRepository.save(collaborator);

        // Send invitation email
        try {
            String invitationToken = savedCollaborator.getId().toString(); // Use ID as token
            emailService.sendInvitationEmail(userToShare, owner, trip, invitationToken);
            log.info("Invitation email sent to: {}", userToShare.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send invitation email: {}", e.getMessage());
            // Don't throw - invitation is still created
        }

        return mapToCollaboratorResponse(savedCollaborator);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CollaboratorResponse> getTripCollaborators(Long tripId, String userEmail) {
        Trip trip = getTripEntity(tripId, userEmail);
        return collaboratorRepository.findByTrip(trip)
                .stream()
                .map(this::mapToCollaboratorResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeCollaborator(Long tripId, Long collaboratorId, String userEmail) {
        Trip trip = getTripEntity(tripId, userEmail);

        if (!trip.getUser().getEmail().equals(userEmail) && !isAdminCollaborator(trip, userEmail)) {
            throw new RuntimeException("Only the trip owner or admin collaborators can remove collaborators");
        }

        TripCollaborator collaborator = collaboratorRepository.findById(collaboratorId)
                .orElseThrow(() -> new RuntimeException("Collaborator not found"));

        if (collaborator.getUser().equals(trip.getUser())) {
            throw new RuntimeException("Cannot remove the trip owner");
        }

        collaboratorRepository.delete(collaborator);
    }

    @Override
    @Transactional
    public CollaboratorResponse respondToInvitation(Long invitationId, String userEmail, boolean accept) {
        TripCollaborator collaborator = collaboratorRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!collaborator.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("This invitation is not for you");
        }

        if (collaborator.getStatus() != TripCollaborator.InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation has already been responded to");
        }

        collaborator.setStatus(accept ?
                TripCollaborator.InvitationStatus.ACCEPTED :
                TripCollaborator.InvitationStatus.DECLINED);
        collaborator.setRespondedAt(LocalDateTime.now());

        TripCollaborator updatedCollaborator = collaboratorRepository.save(collaborator);
        return mapToCollaboratorResponse(updatedCollaborator);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TripResponse> getSharedTrips(String userEmail) {
        User user = userService.getUserByEmail(userEmail);

        List<TripCollaborator> acceptedShares = collaboratorRepository.findByUserAndStatus(
                user, TripCollaborator.InvitationStatus.ACCEPTED);

        return acceptedShares.stream()
                .map(TripCollaborator::getTrip)
                .map(this::mapToTripResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Trip getTripEntity(Long tripId, String userEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        boolean hasAccess = trip.getUser().getEmail().equals(userEmail) ||
                isAcceptedCollaborator(trip, userEmail) ||
                (trip.getIsPublic() && trip.getStatus() != Trip.TripStatus.CANCELLED);

        if (!hasAccess) {
            throw new RuntimeException("You don't have access to this trip");
        }

        return trip;
    }

    @Override
    @Transactional
    public TripResponse addBookingToTrip(Long tripId, String userEmail, String bookingReference) {
        Trip trip = getTripEntity(tripId, userEmail);

        if (!hasEditPermission(trip, userEmail)) {
            throw new RuntimeException("You don't have permission to add bookings to this trip");
        }

        // FIXED: Add actual booking linking logic
        // Booking booking = bookingRepository.findByBookingReference(bookingReference)
        //         .orElseThrow(() -> new RuntimeException("Booking not found"));
        // booking.setTrip(trip);
        // bookingRepository.save(booking);

        log.info("Booking {} linked to trip {}", bookingReference, tripId);

        return mapToTripResponse(trip);
    }

    // Helper methods
    private boolean hasEditPermission(Trip trip, String userEmail) {
        if (trip.getUser().getEmail().equals(userEmail)) {
            return true;
        }

        return collaboratorRepository.findByTripAndUser(trip, userService.getUserByEmail(userEmail))
                .map(c -> c.getPermissionLevel() == TripCollaborator.PermissionLevel.EDIT ||
                        c.getPermissionLevel() == TripCollaborator.PermissionLevel.ADMIN)
                .orElse(false);
    }

    private boolean isAdminCollaborator(Trip trip, String userEmail) {
        return collaboratorRepository.findByTripAndUser(trip, userService.getUserByEmail(userEmail))
                .map(c -> c.getPermissionLevel() == TripCollaborator.PermissionLevel.ADMIN)
                .orElse(false);
    }

    private boolean isAcceptedCollaborator(Trip trip, String userEmail) {
        return collaboratorRepository.findByTripAndUser(trip, userService.getUserByEmail(userEmail))
                .map(c -> c.getStatus() == TripCollaborator.InvitationStatus.ACCEPTED)
                .orElse(false);
    }

    // Mapping methods
    private TripResponse mapToTripResponse(Trip trip) {
        TripResponse response = new TripResponse();
        response.setId(trip.getId());
        response.setTitle(trip.getTitle());
        response.setDescription(trip.getDescription());
        response.setStartDate(trip.getStartDate());
        response.setEndDate(trip.getEndDate());
        response.setStatus(trip.getStatus() != null ? trip.getStatus().name() : "PLANNING");
        response.setCoverImage(trip.getCoverImage());
        response.setIsPublic(trip.getIsPublic());
        response.setCreatedAt(trip.getCreatedAt());
        response.setUpdatedAt(trip.getUpdatedAt());

        response.setOwner(mapToUserResponse(trip.getUser()));

        if (trip.getDestinations() != null) {
            response.setDestinationCount(trip.getDestinations().size());

            int activityCount = trip.getDestinations().stream()
                    .mapToInt(d -> d.getActivities() != null ? d.getActivities().size() : 0)
                    .sum();
            response.setActivityCount(activityCount);
        }

        return response;
    }

    private DestinationResponse mapToDestinationResponse(Destination destination) {
        DestinationResponse response = new DestinationResponse();
        response.setId(destination.getId());
        response.setName(destination.getName());
        response.setCountry(destination.getCountry());
        response.setCity(destination.getCity());
        response.setArrivalDate(destination.getArrivalDate());
        response.setDepartureDate(destination.getDepartureDate());
        response.setAccommodationName(destination.getAccommodationName());
        response.setAccommodationAddress(destination.getAccommodationAddress());
        response.setAccommodationConfirmation(destination.getAccommodationConfirmation());
        response.setNotes(destination.getNotes());
        response.setLatitude(destination.getLatitude());
        response.setLongitude(destination.getLongitude());
        response.setCreatedAt(destination.getCreatedAt());
        response.setUpdatedAt(destination.getUpdatedAt());

        if (destination.getArrivalDate() != null && destination.getDepartureDate() != null) {
            long nights = destination.getDepartureDate().toEpochDay() - destination.getArrivalDate().toEpochDay();
            response.setNights((int) nights);
        }

        if (destination.getActivities() != null) {
            response.setActivityCount(destination.getActivities().size());
            response.setActivities(destination.getActivities().stream()
                    .map(this::mapToActivityResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    private ActivityResponse mapToActivityResponse(Activity activity) {
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setName(activity.getName());
        response.setTitle(activity.getName()); // Map name to title if needed
        response.setType(activity.getType() != null ? activity.getType().name() : "OTHER");
        response.setDate(activity.getDate());
        response.setStartTime(activity.getStartTime());
        response.setEndTime(activity.getEndTime());
        response.setLocation(activity.getLocation());
        response.setCost(activity.getCost());
        response.setCurrency(activity.getCurrency());
        response.setBookingReference(activity.getBookingReference());
        response.setNotes(activity.getNotes());
        response.setCreatedAt(activity.getCreatedAt());
        response.setUpdatedAt(activity.getUpdatedAt());
        response.setDestinationId(activity.getDestination() != null ? activity.getDestination().getId() : null);
        return response;
    }

    private CollaboratorResponse mapToCollaboratorResponse(TripCollaborator collaborator) {
        CollaboratorResponse response = new CollaboratorResponse();
        response.setId(collaborator.getId());
        response.setUser(mapToUserResponse(collaborator.getUser()));
        response.setPermissionLevel(collaborator.getPermissionLevel() != null ? collaborator.getPermissionLevel().name() : "VIEW");
        response.setStatus(collaborator.getStatus() != null ? collaborator.getStatus().name() : "PENDING");
        response.setInvitedBy(mapToUserResponse(collaborator.getInvitedBy()));
        response.setInvitedAt(collaborator.getInvitedAt());
        response.setRespondedAt(collaborator.getRespondedAt());
        return response;
    }

    private UserResponse mapToUserResponse(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole() != null ? user.getRole().name() : "USER",
                user.getEmailVerified()
        );
    }
}