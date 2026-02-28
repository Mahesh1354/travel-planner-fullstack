package com.travelplanner.backend.controller;

import com.travelplanner.backend.dto.places.PlaceDTO;
import com.travelplanner.backend.dto.request.*;
import com.travelplanner.backend.dto.response.*;
import com.travelplanner.backend.dto.weather.WeatherDTO;
import com.travelplanner.backend.entity.Booking;
import com.travelplanner.backend.entity.Destination;
import com.travelplanner.backend.entity.Trip;
import com.travelplanner.backend.service.BookingService;
import com.travelplanner.backend.service.PlacesService;
import com.travelplanner.backend.service.TripService;
import com.travelplanner.backend.service.WeatherService;  // ADD THIS IMPORT
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
    private final BookingService bookingService;
    private final WeatherService weatherService;
    private final PlacesService placesService;

    // ============== TRIP ENDPOINTS ==============

    @PostMapping
    public ResponseEntity<?> createTrip(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TripRequest request) {
        try {
            TripResponse response = tripService.createTrip(userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserTrips(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<TripResponse> trips = tripService.getUserTrips(userDetails.getUsername());
            return ResponseEntity.ok(trips);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/shared")
    public ResponseEntity<?> getSharedTrips(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<TripResponse> trips = tripService.getSharedTrips(userDetails.getUsername());
            return ResponseEntity.ok(trips);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<?> getTrip(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            TripResponse response = tripService.getTrip(tripId, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<?> updateTrip(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId,
            @Valid @RequestBody TripRequest request) {
        try {
            TripResponse response = tripService.updateTrip(tripId, userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<?> deleteTrip(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            tripService.deleteTrip(tripId, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Trip deleted successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/{tripId}/duplicate")
    public ResponseEntity<?> duplicateTrip(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            TripResponse response = tripService.duplicateTrip(tripId, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== DESTINATION ENDPOINTS ==============

    @PostMapping("/{tripId}/destinations")
    public ResponseEntity<?> addDestination(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId,
            @Valid @RequestBody DestinationRequest request) {
        try {
            DestinationResponse response = tripService.addDestination(tripId, userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/{tripId}/destinations")
    public ResponseEntity<?> getTripDestinations(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            List<DestinationResponse> destinations = tripService.getTripDestinations(tripId, userDetails.getUsername());
            return ResponseEntity.ok(destinations);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PutMapping("/destinations/{destinationId}")
    public ResponseEntity<?> updateDestination(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long destinationId,
            @Valid @RequestBody DestinationRequest request) {
        try {
            DestinationResponse response = tripService.updateDestination(destinationId, userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @DeleteMapping("/destinations/{destinationId}")
    public ResponseEntity<?> removeDestination(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long destinationId) {
        try {
            tripService.removeDestination(destinationId, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Destination removed successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== ACTIVITY ENDPOINTS ==============

    @PostMapping("/destinations/{destinationId}/activities")
    public ResponseEntity<?> addActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long destinationId,
            @Valid @RequestBody ActivityRequest request) {
        try {
            ActivityResponse response = tripService.addActivity(destinationId, userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/destinations/{destinationId}/activities")
    public ResponseEntity<?> getDestinationActivities(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long destinationId) {
        try {
            List<ActivityResponse> activities = tripService.getDestinationActivities(destinationId, userDetails.getUsername());
            return ResponseEntity.ok(activities);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PutMapping("/activities/{activityId}")
    public ResponseEntity<?> updateActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long activityId,
            @Valid @RequestBody ActivityRequest request) {
        try {
            ActivityResponse response = tripService.updateActivity(activityId, userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @DeleteMapping("/activities/{activityId}")
    public ResponseEntity<?> removeActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long activityId) {
        try {
            tripService.removeActivity(activityId, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Activity removed successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== SHARING ENDPOINTS ==============

    @PostMapping("/{tripId}/share")
    public ResponseEntity<?> shareTrip(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId,
            @Valid @RequestBody ShareTripRequest request) {
        try {
            CollaboratorResponse response = tripService.shareTrip(tripId, userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/{tripId}/collaborators")
    public ResponseEntity<?> getTripCollaborators(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            List<CollaboratorResponse> collaborators = tripService.getTripCollaborators(tripId, userDetails.getUsername());
            return ResponseEntity.ok(collaborators);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @DeleteMapping("/{tripId}/collaborators/{collaboratorId}")
    public ResponseEntity<?> removeCollaborator(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId,
            @PathVariable Long collaboratorId) {
        try {
            tripService.removeCollaborator(tripId, collaboratorId, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Collaborator removed successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/invitations/{invitationId}/respond")
    public ResponseEntity<?> respondToInvitation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long invitationId,
            @RequestParam boolean accept) {
        try {
            CollaboratorResponse response = tripService.respondToInvitation(invitationId, userDetails.getUsername(), accept);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== BOOKING ENDPOINTS ==============

    @GetMapping("/{tripId}/bookings")
    public ResponseEntity<?> getTripBookings(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            List<BookingDTO> bookings = bookingService.getTripBookings(tripId, userDetails.getUsername());
            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/{tripId}/bookings/{bookingReference}/link")
    public ResponseEntity<?> linkBookingToTrip(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId,
            @PathVariable String bookingReference) {
        try {
            BookingConfirmationResponse response = bookingService.addBookingToTrip(
                    bookingReference, tripId, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Booking linked to trip successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== WEATHER ENDPOINT ==============

    @GetMapping("/{tripId}/weather")
    public ResponseEntity<?> getTripWeather(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            Trip trip = tripService.getTripEntity(tripId, userDetails.getUsername());

            if (trip.getDestinations() == null || trip.getDestinations().isEmpty()) {
                return ResponseEntity.ok(new MessageResponse("No destinations found", false));
            }

            // Get weather for first destination
            Destination firstDest = trip.getDestinations().iterator().next();
            String location = firstDest.getCity() + "," + firstDest.getCountry();

            WeatherDTO weather = weatherService.getCurrentWeather(location);
            return ResponseEntity.ok(weather);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/{tripId}/destinations/{destinationId}/places")
    public ResponseEntity<?> getNearbyPlaces(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId,
            @PathVariable Long destinationId,
            @RequestParam(defaultValue = "tourism.attraction,catering.restaurant") String categories,
            @RequestParam(defaultValue = "2000") int radius) {
        try {
            // Verify trip access
            Trip trip = tripService.getTripEntity(tripId, userDetails.getUsername());

            // Get destination
            Destination destination = trip.getDestinations().stream()
                    .filter(d -> d.getId().equals(destinationId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Destination not found"));

            // Search for nearby places
            List<PlaceDTO> places = placesService.searchNearby(
                    destination.getLatitude() != null ? destination.getLatitude() : 0,
                    destination.getLongitude() != null ? destination.getLongitude() : 0,
                    radius,
                    categories
            );

            return ResponseEntity.ok(places);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

}