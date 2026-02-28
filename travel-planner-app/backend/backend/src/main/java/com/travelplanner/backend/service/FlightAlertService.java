package com.travelplanner.backend.service;

import com.travelplanner.backend.entity.Booking;
import com.travelplanner.backend.entity.Trip;
import com.travelplanner.backend.event.FlightEvent;
import com.travelplanner.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightAlertService {

    private final BookingRepository bookingRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final TripService tripService;

    private final String[] flightStatuses = {
            "On Time",
            "Delayed by 30 minutes",
            "Delayed by 1 hour",
            "Delayed by 2 hours",
            "Gate changed to A12",
            "Boarding at ",
            "Cancelled due to weather"
    };

    @Scheduled(fixedDelay = 3600000)
    public void checkFlightStatus() {
        log.info("Checking flight status for upcoming bookings");
        List<Booking> upcomingFlights = getUpcomingFlights(LocalDateTime.now(), LocalDateTime.now().plusDays(1));

        for (Booking booking : upcomingFlights) {
            checkAndSendFlightAlert(booking);
        }
    }

    private List<Booking> getUpcomingFlights(LocalDateTime start, LocalDateTime end) {
        return List.of(); // Mock implementation
    }

    public void checkAndSendFlightAlert(Booking booking) {
        if (booking.getBookingType() != Booking.BookingType.FLIGHT) {
            return;
        }

        if (ThreadLocalRandom.current().nextDouble() < 0.3) {
            String flightNumber = extractFlightNumber(booking);
            int statusIndex = ThreadLocalRandom.current().nextInt(flightStatuses.length);
            String status = flightStatuses[statusIndex];

            if (status.startsWith("Boarding at")) {
                int hour = ThreadLocalRandom.current().nextInt(10, 22);
                int minute = ThreadLocalRandom.current().nextInt(0, 59);
                status = String.format("Boarding at %02d:%02d", hour, minute);
            }

            String updateMessage = String.format("Flight %s: %s", flightNumber, status);

            Trip trip = booking.getTrip();
            if (trip != null) {
                // Publish event instead of calling dispatcher directly
                eventPublisher.publishEvent(new FlightEvent(
                        this,
                        trip.getId(),
                        flightNumber,
                        updateMessage,
                        trip.getUser().getEmail()
                ));
            }
        }
    }

    private String extractFlightNumber(Booking booking) {
        if (booking.getBookingDetails() != null &&
                booking.getBookingDetails().containsKey("flight")) {
            return booking.getBookingDetails().get("flight").toString();
        }
        return "Unknown Flight";
    }
}