package com.travelplanner.backend.event;

import com.travelplanner.backend.entity.Trip;
import com.travelplanner.backend.entity.TripCollaborator;
import com.travelplanner.backend.service.NotificationService;
import com.travelplanner.backend.service.TripService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final TripService tripService; // This is fine here - listeners can depend on services

    @EventListener
    public void handleActivityEvent(ActivityEvent event) {
        log.info("Processing activity event: {} - {}", event.getEventType(), event.getActivityName());

        try {
            Trip trip = tripService.getTripEntity(event.getTripId(), event.getUserEmail());
            String title = "Group Activity Update";
            String message = event.getUpdatedBy() + " " +
                    (event.getEventType() == ActivityEvent.EventType.ADDED ? "added" : "updated") +
                    " activity: " + event.getActivityName();

            // Notify all collaborators except the one who made the change
            if (trip.getCollaborators() != null) {
                trip.getCollaborators().stream()
                        .filter(c -> c.getStatus() == TripCollaborator.InvitationStatus.ACCEPTED)
                        .filter(c -> !c.getUser().getEmail().equals(event.getUpdatedBy()))
                        .forEach(c -> notificationService.sendNotificationToUser(
                                c.getUser().getId(), "GROUP_ACTIVITY", title, message, event.getTripId()));
            }

            // Also notify owner if they're not the updater
            if (!trip.getUser().getEmail().equals(event.getUpdatedBy())) {
                notificationService.sendNotificationToUser(
                        trip.getUser().getId(), "GROUP_ACTIVITY", title, message, event.getTripId());
            }
        } catch (Exception e) {
            log.error("Failed to process activity event", e);
        }
    }

    @EventListener
    public void handleFlightEvent(FlightEvent event) {
        log.info("Processing flight event for flight: {}", event.getFlightNumber());

        try {
            Trip trip = tripService.getTripEntity(event.getTripId(), event.getUserEmail());
            String title = "Flight " + event.getFlightNumber() + " Update";

            notificationService.sendNotificationToUser(
                    trip.getUser().getId(), "FLIGHT_UPDATE", title, event.getUpdateMessage(), event.getTripId());

            if (trip.getCollaborators() != null) {
                trip.getCollaborators().stream()
                        .filter(c -> c.getStatus() == TripCollaborator.InvitationStatus.ACCEPTED)
                        .forEach(c -> notificationService.sendNotificationToUser(
                                c.getUser().getId(), "FLIGHT_UPDATE", title, event.getUpdateMessage(), event.getTripId()));
            }
        } catch (Exception e) {
            log.error("Failed to process flight event", e);
        }
    }

    @EventListener
    public void handleWeatherEvent(WeatherEvent event) {
        log.info("Processing weather event for destination: {}", event.getDestination());

        try {
            Trip trip = tripService.getTripEntity(event.getTripId(), event.getUserEmail());
            String title = "Weather Alert for " + event.getDestination();

            notificationService.sendNotificationToUser(
                    trip.getUser().getId(), "WEATHER_ALERT", title, event.getWeatherMessage(), event.getTripId());

            if (trip.getCollaborators() != null) {
                trip.getCollaborators().stream()
                        .filter(c -> c.getStatus() == TripCollaborator.InvitationStatus.ACCEPTED)
                        .forEach(c -> notificationService.sendNotificationToUser(
                                c.getUser().getId(), "WEATHER_ALERT", title, event.getWeatherMessage(), event.getTripId()));
            }
        } catch (Exception e) {
            log.error("Failed to process weather event", e);
        }
    }
}