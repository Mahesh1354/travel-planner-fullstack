package com.travelplanner.backend.service;

import com.travelplanner.backend.entity.Trip;
import com.travelplanner.backend.event.WeatherEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherAlertService {

    private final TripService tripService;
    private final ApplicationEventPublisher eventPublisher;

    private final Map<String, String[]> weatherConditions = new HashMap<>() {{
        put("Paris", new String[]{"Sunny", "18-22°C", "Clear skies"});
        put("New York", new String[]{"Partly Cloudy", "15-20°C", "Mild temperatures"});
        put("London", new String[]{"Rainy", "12-16°C", "Bring umbrella"});
        put("Tokyo", new String[]{"Humid", "22-26°C", "High humidity"});
        put("Sydney", new String[]{"Sunny", "20-25°C", "Perfect weather"});
    }};

    @Scheduled(cron = "0 0 6 * * ?")
    public void checkWeatherForUpcomingTrips() {
        log.info("Checking weather for upcoming trips");
        List<Trip> upcomingTrips = getUpcomingTrips(LocalDate.now(), LocalDate.now().plusDays(3));

        for (Trip trip : upcomingTrips) {
            checkAndSendWeatherAlert(trip);
        }
    }

    private List<Trip> getUpcomingTrips(LocalDate start, LocalDate end) {
        return List.of(); // Mock implementation
    }

    public void checkAndSendWeatherAlert(Trip trip) {
        if (trip.getDestinations() == null || trip.getDestinations().isEmpty()) {
            return;
        }

        String destination = trip.getDestinations().iterator().next().getCity();
        String[] weather = weatherConditions.getOrDefault(destination,
                new String[]{"Variable", "15-20°C", "Check local forecast"});

        String weatherMessage = String.format("Weather in %s: %s, %s. %s",
                destination, weather[0], weather[1], weather[2]);

        // Publish event instead of calling dispatcher directly
        eventPublisher.publishEvent(new WeatherEvent(
                this,
                trip.getId(),
                destination,
                weatherMessage,
                trip.getUser().getEmail()
        ));
    }
}