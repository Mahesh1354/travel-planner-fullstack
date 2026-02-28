package com.travelplanner.backend.service.impl;

import com.travelplanner.backend.dto.request.BookingRequest;
import com.travelplanner.backend.dto.response.BookingConfirmationResponse;
import com.travelplanner.backend.dto.response.BookingDTO;
import com.travelplanner.backend.entity.*;
import com.travelplanner.backend.event.BookingEvent;
import com.travelplanner.backend.repository.*;
import com.travelplanner.backend.service.BookingService;
import com.travelplanner.backend.service.EmailService;
import com.travelplanner.backend.service.TripService;
import com.travelplanner.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;  // ADD THIS IMPORT
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserService userService;
    private final TripService tripService;  // Remove @Lazy if not needed
    private final DestinationRepository destinationRepository;
    private final ActivityRepository activityRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final EmailService emailService;  // MOVE THIS UP with other final fields

    @Override
    @Transactional
    public BookingConfirmationResponse createBooking(String userEmail, BookingRequest request) {
        User user = userService.getUserByEmail(userEmail);

        // Generate a unique booking reference
        String bookingReference = generateBookingReference(request.getBookingType());

        // Create mock booking details
        Map<String, Object> bookingDetails = new HashMap<>();
        bookingDetails.put("itemId", request.getItemId());
        bookingDetails.put("passengerDetails", request.getPassengerDetails());
        bookingDetails.put("bookingTime", LocalDateTime.now().toString());
        bookingDetails.put("provider", "Amadeus");

        // Generate a mock price (in real implementation, this would come from the API)
        double mockPrice = 500.00 + Math.random() * 500;

        // Build confirmation response
        BookingConfirmationResponse confirmation = BookingConfirmationResponse.builder()
                .bookingReference(bookingReference)
                .status("CONFIRMED")
                .provider("Amadeus")
                .bookingDetails(bookingDetails)
                .totalPrice(mockPrice)
                .currency("USD")
                .bookedAt(LocalDateTime.now())
                .build();

        // Save booking to database
        Booking booking = new Booking();
        booking.setBookingReference(confirmation.getBookingReference());
        booking.setBookingType(Booking.BookingType.valueOf(request.getBookingType()));
        booking.setUser(user);
        booking.setProvider(confirmation.getProvider());
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setBookingDetails(safeBookingDetails(bookingDetails));
        booking.setTotalPrice(BigDecimal.valueOf(confirmation.getTotalPrice()));
        booking.setCurrency(confirmation.getCurrency());
        booking.setBookedAt(LocalDateTime.now());

        // Publish event for notifications
        if (request.getTripId() != null) {
            eventPublisher.publishEvent(new BookingEvent(
                    this,
                    request.getTripId(),
                    confirmation.getBookingReference(),
                    request.getBookingType(),
                    userEmail,
                    BookingEvent.EventType.CREATED
            ));
        }

        // Link to trip if provided
        if (request.getTripId() != null) {
            Trip trip = tripService.getTripEntity(request.getTripId(), userEmail);
            booking.setTrip(trip);
        }

        // Link to destination if provided
        if (request.getDestinationId() != null) {
            Destination destination = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new RuntimeException("Destination not found"));
            booking.setDestination(destination);
        }

        bookingRepository.save(booking);

        // Send booking confirmation email - MOVED INSIDE THE METHOD
        try {
            emailService.sendBookingConfirmation(user, booking);
            log.info("Booking confirmation email sent to: {}", user.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send booking confirmation email: {}", e.getMessage());
        }

        // If booking is for an activity and destination is provided, update the activity
        if (request.getBookingType().equals("ACTIVITY") && request.getDestinationId() != null) {
            log.info("Booking linked to destination: {}", request.getDestinationId());
        }

        return confirmation;
    }

    @Override
    public BookingConfirmationResponse getBookingStatus(String bookingReference, String userEmail) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify ownership
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You don't have access to this booking");
        }

        // In a real implementation, you would check with the provider's API
        // For now, return the stored status
        return BookingConfirmationResponse.builder()
                .bookingReference(bookingReference)
                .status(booking.getStatus().toString())
                .provider(booking.getProvider())
                .bookingDetails(booking.getBookingDetails())
                .totalPrice(booking.getTotalPrice() != null ? booking.getTotalPrice().doubleValue() : 0.0)
                .currency(booking.getCurrency())
                .bookedAt(booking.getBookedAt())
                .build();
    }

    @Override
    public List<BookingDTO> getUserBookings(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        return bookingRepository.findByUserOrderByBookedAtDesc(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingDTO> getTripBookings(Long tripId, String userEmail) {
        // Verify access to trip
        tripService.getTripEntity(tripId, userEmail);
        return bookingRepository.findByTripId(tripId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingConfirmationResponse cancelBooking(String bookingReference, String userEmail) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify ownership
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You don't have permission to cancel this booking");
        }

        // In a real implementation, you would call the provider's cancellation API
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);

        return BookingConfirmationResponse.builder()
                .bookingReference(bookingReference)
                .status("CANCELLED")
                .provider(booking.getProvider())
                .bookedAt(booking.getBookedAt())
                .totalPrice(booking.getTotalPrice() != null ? booking.getTotalPrice().doubleValue() : 0.0)
                .currency(booking.getCurrency())
                .build();
    }

    @Override
    @Transactional
    public BookingConfirmationResponse addBookingToTrip(String bookingReference, Long tripId, String userEmail) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify booking ownership
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You don't have permission to modify this booking");
        }

        Trip trip = tripService.getTripEntity(tripId, userEmail);
        booking.setTrip(trip);
        bookingRepository.save(booking);

        return getBookingStatus(bookingReference, userEmail);
    }

    @Override
    @Transactional
    public BookingConfirmationResponse addBookingToDestination(String bookingReference, Long destinationId, String userEmail) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify booking ownership
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You don't have permission to modify this booking");
        }

        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        // Verify access to destination's trip
        tripService.getTripEntity(destination.getTrip().getId(), userEmail);

        booking.setDestination(destination);
        bookingRepository.save(booking);

        return getBookingStatus(bookingReference, userEmail);
    }

    @Override
    @Transactional
    public BookingConfirmationResponse addBookingToActivity(String bookingReference, Long activityId, String userEmail) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify booking ownership
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("You don't have permission to modify this booking");
        }

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        // Verify access to activity's destination's trip
        tripService.getTripEntity(activity.getDestination().getTrip().getId(), userEmail);

        booking.setActivity(activity);
        bookingRepository.save(booking);

        // Update activity with booking reference
        activity.setBookingReference(bookingReference);
        activityRepository.save(activity);

        return getBookingStatus(bookingReference, userEmail);
    }

    private Map<String, Object> safeBookingDetails(Map<String, Object> details) {
        return details != null ? details : new HashMap<>();
    }

    private String generateBookingReference(String bookingType) {
        String prefix;
        switch (bookingType.toUpperCase()) {
            case "FLIGHT":
                prefix = "FL";
                break;
            case "ACCOMMODATION":
                prefix = "HT";
                break;
            case "ACTIVITY":
                prefix = "ACT";
                break;
            default:
                prefix = "BK";
        }
        return prefix + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BookingDTO mapToDTO(Booking booking) {
        BookingDTO.BookingDTOBuilder builder = BookingDTO.builder()
                .id(booking.getId())
                .bookingReference(booking.getBookingReference())
                .bookingType(booking.getBookingType() != null ? booking.getBookingType().name() : null)
                .provider(booking.getProvider())
                .status(booking.getStatus() != null ? booking.getStatus().name() : null)
                .totalPrice(booking.getTotalPrice())
                .currency(booking.getCurrency())
                .bookedAt(booking.getBookedAt())
                .cancelledAt(booking.getCancelledAt())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .userEmail(booking.getUser() != null ? booking.getUser().getEmail() : null)
                .userFirstName(booking.getUser() != null ? booking.getUser().getFirstName() : null)
                .userLastName(booking.getUser() != null ? booking.getUser().getLastName() : null);

        if (booking.getTrip() != null) {
            builder.tripId(booking.getTrip().getId())
                    .tripTitle(booking.getTrip().getTitle());
        }

        if (booking.getDestination() != null) {
            builder.destinationId(booking.getDestination().getId())
                    .destinationName(booking.getDestination().getName());
        }

        if (booking.getActivity() != null) {
            builder.activityId(booking.getActivity().getId())
                    .activityName(booking.getActivity().getName());
        }

        return builder.build();
    }
}