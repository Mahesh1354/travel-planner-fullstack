package com.travelplanner.backend.client.mock;

import com.travelplanner.backend.client.RecommendationApiClient;
import com.travelplanner.backend.dto.request.RecommendationRequest;
import com.travelplanner.backend.dto.response.RecommendationResponse;
import com.travelplanner.backend.dto.response.PlaceResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Component
@Slf4j
public class MockRecommendationApiClient implements RecommendationApiClient {

    private final Map<String, List<PlaceResponse>> mockPlacesByCity = new HashMap<>();
    private final List<String> cuisines = Arrays.asList("Italian", "French", "Japanese", "Mexican", "Thai", "Indian", "American");
    private final List<String> activityTypes = Arrays.asList("Museum", "Park", "Historical Site", "Shopping Mall", "Concert Hall", "Theater");
    private final List<String> priceLevels = Arrays.asList("$", "$$", "$$$", "$$$$");

    public MockRecommendationApiClient() {
        initializeMockData();
    }

    private void initializeMockData() {
        // Paris mock data
        List<PlaceResponse> parisPlaces = new ArrayList<>();
        parisPlaces.add(createPlace("1", "Eiffel Tower", "Paris", "France",
                "Iconic iron tower", "SIGHTSEEING", 4.8, 25000, 25.0, "$$"));
        parisPlaces.add(createPlace("2", "Louvre Museum", "Paris", "France",
                "World's largest art museum", "CULTURAL", 4.7, 40000, 17.0, "$$"));
        parisPlaces.add(createPlace("3", "Le Meurice", "Paris", "France",
                "Michelin-starred French cuisine", "FOOD", 4.9, 1200, 150.0, "$$$$"));
        parisPlaces.add(createPlace("4", "Seine River Cruise", "Paris", "France",
                "Scenic boat tour", "ACTIVITIES", 4.5, 8000, 15.0, "$$"));
        parisPlaces.add(createPlace("5", "Montmartre", "Paris", "France",
                "Artistic neighborhood with Sacré-Cœur", "SIGHTSEEING", 4.6, 15000, 0.0, "$"));
        mockPlacesByCity.put("Paris", parisPlaces);

        // New York mock data
        List<PlaceResponse> nycPlaces = new ArrayList<>();
        nycPlaces.add(createPlace("6", "Statue of Liberty", "New York", "USA",
                "Iconic national monument", "SIGHTSEEING", 4.7, 30000, 24.0, "$$"));
        nycPlaces.add(createPlace("7", "Central Park", "New York", "USA",
                "Urban park", "PARK", 4.8, 50000, 0.0, "$"));
        nycPlaces.add(createPlace("8", "Katz's Delicatessen", "New York", "USA",
                "Famous Jewish deli", "FOOD", 4.6, 8000, 25.0, "$$"));
        nycPlaces.add(createPlace("9", "Broadway Show", "New York", "USA",
                "Theater district", "CULTURAL", 4.9, 20000, 120.0, "$$$"));
        nycPlaces.add(createPlace("10", "MET Museum", "New York", "USA",
                "Metropolitan Museum of Art", "CULTURAL", 4.8, 35000, 25.0, "$$"));
        mockPlacesByCity.put("New York", nycPlaces);

        // Tokyo mock data
        List<PlaceResponse> tokyoPlaces = new ArrayList<>();
        tokyoPlaces.add(createPlace("11", "Tokyo Tower", "Tokyo", "Japan",
                "Communications tower", "SIGHTSEEING", 4.5, 15000, 12.0, "$$"));
        tokyoPlaces.add(createPlace("12", "Senso-ji Temple", "Tokyo", "Japan",
                "Ancient Buddhist temple", "CULTURAL", 4.7, 20000, 0.0, "$"));
        tokyoPlaces.add(createPlace("13", "Sukiyabashi Jiro", "Tokyo", "Japan",
                "Legendary sushi restaurant", "FOOD", 4.9, 500, 300.0, "$$$$"));
        mockPlacesByCity.put("Tokyo", tokyoPlaces);

        // London mock data
        List<PlaceResponse> londonPlaces = new ArrayList<>();
        londonPlaces.add(createPlace("14", "Big Ben", "London", "UK",
                "Famous clock tower", "SIGHTSEEING", 4.7, 22000, 0.0, "$"));
        londonPlaces.add(createPlace("15", "British Museum", "London", "UK",
                "Museum of human history", "CULTURAL", 4.8, 38000, 0.0, "$"));
        londonPlaces.add(createPlace("16", "The Shard", "London", "UK",
                "Skyscraper with viewing platform", "SIGHTSEEING", 4.6, 12000, 32.0, "$$$"));
        mockPlacesByCity.put("London", londonPlaces);
    }

    private PlaceResponse createPlace(String id, String name, String city, String country,
                                      String description, String category, double rating,
                                      int reviews, double price, String priceLevel) {
        PlaceResponse place = new PlaceResponse();
        place.setId(id);
        place.setName(name);
        place.setCity(city);
        place.setCountry(country);
        place.setDescription(description);
        place.setCategory(category);
        place.setRating(rating);
        place.setTotalReviews(reviews);
        place.setPrice(price);
        place.setPriceLevel(priceLevel);
        place.setImageUrl("https://example.com/images/" + id + ".jpg");
        place.setLatitude(48.8566 + ThreadLocalRandom.current().nextDouble(-0.1, 0.1));
        place.setLongitude(2.3522 + ThreadLocalRandom.current().nextDouble(-0.1, 0.1));
        place.setWebsite("https://www.example.com");
        place.setPhoneNumber("+33 1 23 45 67 89");
        place.setOpeningHours(Arrays.asList("Mon-Sun: 9am-6pm"));
        return place;
    }

    @Override
    public List<RecommendationResponse> getRecommendations(RecommendationRequest request) {
        log.info("Mock recommendation request for location: {}", request.getLocation());

        String city = extractCity(request.getLocation());
        List<PlaceResponse> places = mockPlacesByCity.getOrDefault(city, new ArrayList<>());

        // Filter by categories if specified
        if (request.getCategories() != null && !request.getCategories().isEmpty()) {
            places = places.stream()
                    .filter(p -> request.getCategories().contains(p.getCategory()))
                    .collect(Collectors.toList());
        }

        // Filter by budget
        if (request.getBudgetLevel() != null) {
            switch (request.getBudgetLevel().toLowerCase()) {
                case "budget":
                    places = places.stream()
                            .filter(p -> p.getPriceLevel().equals("$") || p.getPrice() <= 20)
                            .collect(Collectors.toList());
                    break;
                case "mid_range":
                    places = places.stream()
                            .filter(p -> p.getPriceLevel().equals("$$") || (p.getPrice() > 20 && p.getPrice() <= 100))
                            .collect(Collectors.toList());
                    break;
                case "luxury":
                    places = places.stream()
                            .filter(p -> p.getPriceLevel().equals("$$$") || p.getPriceLevel().equals("$$$$") || p.getPrice() > 100)
                            .collect(Collectors.toList());
                    break;
            }
        }

        // Convert to recommendations
        List<RecommendationResponse> recommendations = new ArrayList<>();
        for (int i = 0; i < Math.min(places.size(), 10); i++) {
            PlaceResponse place = places.get(i);
            RecommendationResponse rec = new RecommendationResponse();
            rec.setId(UUID.randomUUID().toString());
            rec.setPlace(place);
            rec.setScore(0.95 - (i * 0.05));
            rec.setReason("Popular among travelers with similar interests");
            rec.setCategory(place.getCategory());
            recommendations.add(rec);
        }

        return recommendations;
    }

    @Override
    public List<PlaceResponse> searchPlaces(String location, String query, int limit) {
        log.info("Mock place search: {} in {}", query, location);

        String city = extractCity(location);
        List<PlaceResponse> places = mockPlacesByCity.getOrDefault(city, new ArrayList<>());

        if (query != null && !query.isEmpty()) {
            String lowerQuery = query.toLowerCase();
            places = places.stream()
                    .filter(p -> p.getName().toLowerCase().contains(lowerQuery) ||
                            p.getDescription().toLowerCase().contains(lowerQuery) ||
                            p.getCategory().toLowerCase().contains(lowerQuery))
                    .collect(Collectors.toList());
        }

        return places.stream().limit(limit).collect(Collectors.toList());
    }

    @Override
    public PlaceResponse getPlaceDetails(String placeId) {
        // Find place by ID across all cities
        for (List<PlaceResponse> places : mockPlacesByCity.values()) {
            for (PlaceResponse place : places) {
                if (place.getId().equals(placeId)) {
                    return place;
                }
            }
        }
        return null;
    }

    @Override
    public List<String> getPopularCategories(String location) {
        return Arrays.asList("SIGHTSEEING", "FOOD", "CULTURAL", "SHOPPING", "NIGHTLIFE");
    }

    private String extractCity(String location) {
        if (location.contains(",")) {
            return location.split(",")[0].trim();
        }
        return location.trim();
    }
}