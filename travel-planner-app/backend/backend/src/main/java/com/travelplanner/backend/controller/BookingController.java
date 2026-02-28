package com.travelplanner.backend.controller;

import com.travelplanner.backend.dto.amadeus.AirportDTO;
import com.travelplanner.backend.dto.request.*;
import com.travelplanner.backend.dto.response.*;
import com.travelplanner.backend.entity.Booking;
import com.travelplanner.backend.service.SearchService;
import com.travelplanner.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final SearchService searchService;
    private final BookingService bookingService;

    // ============== SEARCH ENDPOINTS ==============

    @PostMapping("/search/flights")
    public ResponseEntity<?> searchFlights(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FlightSearchRequest request) {
        try {
            FlightSearchResponse response = searchService.searchFlights(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/search/accommodations")
    public ResponseEntity<?> searchAccommodations(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AccommodationSearchRequest request) {
        try {
            AccommodationSearchResponse response = searchService.searchAccommodations(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/search/activities")
    public ResponseEntity<?> searchActivities(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ActivitySearchRequest request) {
        try {
            ActivitySearchResponse response = searchService.searchActivities(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/search/airports")
    public ResponseEntity<?> searchAirports(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String keyword) {
        try {
            List<AirportDTO> airports = searchService.searchAirports(keyword);
            return ResponseEntity.ok(airports);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== BOOKING ENDPOINTS ==============

    @PostMapping("/create")
    public ResponseEntity<?> createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookingRequest request) {
        try {
            BookingConfirmationResponse response = bookingService.createBooking(
                    userDetails.getUsername(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/{bookingReference}")
    public ResponseEntity<?> getBookingStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String bookingReference) {
        try {
            BookingConfirmationResponse response = bookingService.getBookingStatus(
                    bookingReference, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserBookings(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<BookingDTO> bookings = bookingService.getUserBookings(userDetails.getUsername());
            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/trip/{tripId}")
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

    @PostMapping("/{bookingReference}/cancel")
    public ResponseEntity<?> cancelBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String bookingReference) {
        try {
            BookingConfirmationResponse response = bookingService.cancelBooking(
                    bookingReference, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/{bookingReference}/link-to-trip/{tripId}")
    public ResponseEntity<?> linkBookingToTrip(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String bookingReference,
            @PathVariable Long tripId) {
        try {
            BookingConfirmationResponse response = bookingService.addBookingToTrip(
                    bookingReference, tripId, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Booking linked to trip successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/{bookingReference}/link-to-destination/{destinationId}")
    public ResponseEntity<?> linkBookingToDestination(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String bookingReference,
            @PathVariable Long destinationId) {
        try {
            BookingConfirmationResponse response = bookingService.addBookingToDestination(
                    bookingReference, destinationId, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Booking linked to destination successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PostMapping("/{bookingReference}/link-to-activity/{activityId}")
    public ResponseEntity<?> linkBookingToActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String bookingReference,
            @PathVariable Long activityId) {
        try {
            BookingConfirmationResponse response = bookingService.addBookingToActivity(
                    bookingReference, activityId, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Booking linked to activity successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }
}