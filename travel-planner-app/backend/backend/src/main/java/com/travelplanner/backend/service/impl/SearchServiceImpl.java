package com.travelplanner.backend.service.impl;

import com.travelplanner.backend.dto.amadeus.FlightOfferDTO;
import com.travelplanner.backend.dto.amadeus.HotelOfferDTO;
import com.travelplanner.backend.dto.amadeus.AirportDTO;
import com.travelplanner.backend.dto.request.FlightSearchRequest;
import com.travelplanner.backend.dto.request.AccommodationSearchRequest;
import com.travelplanner.backend.dto.request.ActivitySearchRequest;
import com.travelplanner.backend.dto.response.FlightSearchResponse;
import com.travelplanner.backend.dto.response.AccommodationSearchResponse;
import com.travelplanner.backend.dto.response.ActivitySearchResponse;
import com.travelplanner.backend.service.AmadeusService;
import com.travelplanner.backend.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchServiceImpl implements SearchService {

    private final AmadeusService amadeusService;

    @Override
    public FlightSearchResponse searchFlights(FlightSearchRequest request) {
        log.info("Searching flights from {} to {} on {}",
                request.getOrigin(), request.getDestination(), request.getDepartureDate());

        try {
            List<FlightOfferDTO> flights = amadeusService.searchFlights(
                    request.getOrigin(),
                    request.getDestination(),
                    request.getDepartureDate().toString(),
                    request.getReturnDate() != null ? request.getReturnDate().toString() : null,
                    request.getAdults(),
                    request.getCabinClass()
            );

            return new FlightSearchResponse(flights);

        } catch (Exception e) {
            log.error("Error searching flights: {}", e.getMessage());
            // Return empty response instead of throwing exception
            return new FlightSearchResponse(new ArrayList<>());
        }
    }

    @Override
    public AccommodationSearchResponse searchAccommodations(AccommodationSearchRequest request) {
        log.info("Searching hotels in {} from {} to {}",
                request.getLocation(), request.getCheckIn(), request.getCheckOut());

        try {
            // First search for the city code
            List<AirportDTO> airports = amadeusService.searchAirports(request.getLocation());

            if (airports.isEmpty()) {
                log.warn("No airports found for location: {}", request.getLocation());
                // Use the error constructor
                return new AccommodationSearchResponse("No airports found for location: " + request.getLocation());
            }

            // Use the first airport's code as city code
            String cityCode = airports.get(0).getCode();
            log.info("Using city code: {} for location: {}", cityCode, request.getLocation());

            List<HotelOfferDTO> hotels = amadeusService.searchHotels(
                    cityCode,
                    request.getCheckIn().toString(),
                    request.getCheckOut().toString(),
                    request.getGuests(),
                    request.getRooms()
            );

            // Success case - use the success constructor
            return new AccommodationSearchResponse(hotels);

        } catch (Exception e) {
            log.error("Error searching hotels: {}", e.getMessage());
            // Use the error constructor
            return new AccommodationSearchResponse(e.getMessage());
        }
    }

    @Override
    public ActivitySearchResponse searchActivities(ActivitySearchRequest request) {
        log.info("Searching activities in {} on {}",
                request.getLocation(), request.getDate());

        try {
            List<ActivitySearchResponse.ActivityOption> activities = generateMockActivities(request);
            return new ActivitySearchResponse(activities);

        } catch (Exception e) {
            log.error("Error generating activities: {}", e.getMessage());
            return new ActivitySearchResponse(new ArrayList<>());
        }
    }

    @Override
    public List<AirportDTO> searchAirports(String keyword) {
        log.info("Searching airports with keyword: {}", keyword);

        try {
            return amadeusService.searchAirports(keyword);
        } catch (Exception e) {
            log.error("Error searching airports: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private List<ActivitySearchResponse.ActivityOption> generateMockActivities(ActivitySearchRequest request) {
        List<ActivitySearchResponse.ActivityOption> activities = new ArrayList<>();

        String[] activityNames = {
                "City Walking Tour", "Museum Visit", "Cooking Class", "Wine Tasting",
                "Hiking Adventure", "Boat Cruise", "Concert", "Theater Show",
                "Food Tasting Tour", "Historical Sites Tour", "Photography Walk", "Sunset Cruise"
        };

        String[] activityTypes = {"Tour", "Museum", "Adventure", "Food", "Cultural", "Sightseeing"};
        String[] locations = {"Downtown", "City Center", "Old Town", "Waterfront", "Historic District"};

        int numberOfActivities = ThreadLocalRandom.current().nextInt(5, 10);

        for (int i = 0; i < numberOfActivities; i++) {
            ActivitySearchResponse.ActivityOption activity = new ActivitySearchResponse.ActivityOption();

            activity.setId("ACT" + System.currentTimeMillis() + i);
            activity.setName(activityNames[ThreadLocalRandom.current().nextInt(activityNames.length)]);
            activity.setType(activityTypes[ThreadLocalRandom.current().nextInt(activityTypes.length)]);
            activity.setLocation(locations[ThreadLocalRandom.current().nextInt(locations.length)] + ", " + request.getLocation());

            double price = ThreadLocalRandom.current().nextDouble(25, 200);
            activity.setPricePerPerson(price);
            activity.setTotalPrice(price * request.getParticipants());
            activity.setCurrency("USD");

            activity.setAvailableSpots(ThreadLocalRandom.current().nextInt(5, 25));
            activity.setMinParticipants(1);
            activity.setMaxParticipants(ThreadLocalRandom.current().nextInt(10, 20));
            activity.setInstantConfirmation(ThreadLocalRandom.current().nextBoolean());

            // Generate random times
            int startHour = ThreadLocalRandom.current().nextInt(8, 16);
            int endHour = startHour + ThreadLocalRandom.current().nextInt(2, 4);
            activity.setStartTime(String.format("%02d:00", startHour));
            activity.setEndTime(String.format("%02d:00", endHour));

            activities.add(activity);
        }

        return activities;
    }
}