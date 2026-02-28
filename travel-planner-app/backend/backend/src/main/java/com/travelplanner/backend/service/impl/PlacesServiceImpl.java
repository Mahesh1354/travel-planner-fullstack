package com.travelplanner.backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.backend.dto.places.*;
import com.travelplanner.backend.service.PlacesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlacesServiceImpl implements PlacesService {

    @Value("${geoapify.api.key}")
    private String apiKey;

    @Value("${geoapify.base.url:https://api.geoapify.com/v2}")
    private String baseUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final List<String> PLACE_CATEGORIES = Arrays.asList(
            "tourism.attraction",
            "tourism.sights",
            "catering.restaurant",
            "catering.cafe",
            "catering.pub",
            "accommodation.hotel",
            "accommodation.motel",
            "accommodation.guest_house",
            "entertainment.cinema",
            "entertainment.theatre",
            "entertainment.museum",
            "shopping.mall",
            "shopping.supermarket",
            "transport.bus",
            "transport.train",
            "transport.taxi",
            "service.police",
            "service.hospital",
            "service.pharmacy",
            "service.bank",
            "service.post_office",
            "leisure.park",
            "leisure.sports_centre",
            "leisure.fitness_centre"
    );

    @Override
    @Cacheable(value = "places", key = "#request.toString()")
    public List<PlaceDTO> searchPlaces(PlaceSearchRequest request) {
        log.info("Searching places near lat={}, lon={}, radius={}, category={}",
                request.getLatitude(), request.getLongitude(), request.getRadius(), request.getCategory());

        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl + "/places")
                    .queryParam("apiKey", apiKey)
                    .queryParam("filter", String.format("circle:%f,%f,%d",
                            request.getLongitude(), request.getLatitude(), request.getRadius()))
                    .queryParam("bias", String.format("proximity:%f,%f",
                            request.getLongitude(), request.getLatitude()))
                    .queryParam("limit", request.getLimit());

            if (request.getCategory() != null && !request.getCategory().isEmpty()) {
                builder.queryParam("categories", request.getCategory());
            }

            if (request.getQuery() != null && !request.getQuery().isEmpty()) {
                builder.queryParam("text", request.getQuery());
            }

            String url = builder.build().toUriString();
            log.debug("Geoapify URL: {}", url);

            // 🔴 DEBUG: Get raw JSON first
            String rawJson = restTemplate.getForObject(url, String.class);
            log.debug("Raw JSON response: {}", rawJson);

            // Then try to parse
            ObjectMapper mapper = new ObjectMapper();
            GeoapifyResponse response = mapper.readValue(rawJson, GeoapifyResponse.class);

            if (response == null || response.getFeatures() == null) {
                return new ArrayList<>();
            }

            return response.getFeatures().stream()
                    .map(this::mapToPlaceDTO)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error searching places: {}", e.getMessage());
            log.error("Full error", e);  // Print full stack trace
            throw new RuntimeException("Failed to search places: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "autocomplete", key = "#query + #lat + #lon")
    public List<AutocompleteSuggestion> autocomplete(String query, double lat, double lon) {
        log.info("Autocomplete for query: {} at lat={}, lon={}", query, lat, lon);

        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://api.geoapify.com/v1/geocode/autocomplete")
                    .queryParam("text", query)
                    .queryParam("bias", String.format("proximity:%f,%f", lon, lat))
                    .queryParam("limit", 10)
                    .queryParam("apiKey", apiKey)
                    .build()
                    .toUriString();

            GeoapifyAutocompleteResponse response = restTemplate.getForObject(url, GeoapifyAutocompleteResponse.class);

            if (response == null || response.getFeatures() == null) {
                return new ArrayList<>();
            }

            return response.getFeatures().stream()
                    .map(this::mapToSuggestion)
                    .filter(Objects::nonNull)  // 🔴 FIXED: Filter out null results
                    .collect(Collectors.toList());

        } catch (RestClientException e) {
            log.error("Error in autocomplete: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    @Cacheable(value = "placeDetails", key = "#placeId")
    public PlaceDTO getPlaceDetails(String placeId) {
        log.info("Getting details for place ID: {}", placeId);

        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://api.geoapify.com/v2/place-details")
                    .queryParam("id", placeId)
                    .queryParam("apiKey", apiKey)
                    .build()
                    .toUriString();

            GeoapifyResponse response = restTemplate.getForObject(url, GeoapifyResponse.class);

            if (response == null || response.getFeatures() == null || response.getFeatures().isEmpty()) {
                throw new RuntimeException("Place not found: " + placeId);
            }

            PlaceDTO place = mapToPlaceDTO(response.getFeatures().get(0));
            if (place == null) {
                throw new RuntimeException("Failed to map place details for ID: " + placeId);
            }
            return place;

        } catch (RestClientException e) {
            log.error("Error getting place details: {}", e.getMessage());
            throw new RuntimeException("Failed to get place details: " + e.getMessage());
        }
    }

    @Override
    public List<String> getPlaceCategories() {
        return PLACE_CATEGORIES;
    }

    @Override
    public List<PlaceDTO> searchNearby(double lat, double lon, int radius, String category) {
        PlaceSearchRequest request = new PlaceSearchRequest();
        request.setLatitude(lat);
        request.setLongitude(lon);
        request.setRadius(radius);
        request.setCategory(category);
        request.setLimit(20);
        return searchPlaces(request);
    }

    @Override
    public List<PlaceDTO> searchByText(String text, double lat, double lon, int limit) {
        PlaceSearchRequest request = new PlaceSearchRequest();
        request.setLatitude(lat);
        request.setLongitude(lon);
        request.setRadius(20000);
        request.setQuery(text);
        request.setLimit(limit);

        // Default categories for text search
        request.setCategory("tourism.attraction,catering.restaurant,accommodation.hotel,entertainment.museum");

        return searchPlaces(request);
    }

    private PlaceDTO mapToPlaceDTO(GeoapifyResponse.Feature feature) {
        if (feature == null || feature.getProperties() == null) {
            return null;
        }

        var props = feature.getProperties();
        var geometry = feature.getGeometry();

        PlaceDTO.PlaceDTOBuilder builder = PlaceDTO.builder()
                .placeId(props.getPlace_id())
                .name(props.getName())
                .address(props.getFormatted())
                .street(props.getStreet())
                .houseNumber(props.getHousenumber())
                .city(props.getCity())
                .country(props.getCountry())
                .postcode(props.getPostcode())
                .categories(props.getCategories())
                .website(props.getWebsite())
                .phone(props.getPhone())
                .openingHours(props.getOpening_hours())
                .icon(props.getIcon())
                .formattedAddress(props.getFormatted())
                .state(props.getState())
                .suburb(props.getSuburb())
                .description(props.getDescription());

        if (props.getDistance() != null) {
            builder.distance(props.getDistance());
        } else {
            builder.distance(0.0);
        }

        // Try coordinates from geometry first
        if (geometry != null && geometry.getCoordinates() != null && geometry.getCoordinates().size() >= 2) {
            builder.longitude(geometry.getCoordinates().get(0));
            builder.latitude(geometry.getCoordinates().get(1));
        }
        // Fallback to lon/lat from properties
        else if (props.getLon() != null && props.getLat() != null) {
            try {
                builder.longitude(Double.parseDouble(props.getLon()));
                builder.latitude(Double.parseDouble(props.getLat()));
            } catch (NumberFormatException e) {
                log.debug("Could not parse lon/lat from properties");
            }
        }

        return builder.build();
    }

    private AutocompleteSuggestion mapToSuggestion(GeoapifyAutocompleteResponse.AutocompleteFeature feature) {
        // 🔴 FIXED: Add null checks
        if (feature == null || feature.getProperties() == null) {
            log.warn("Received null autocomplete feature or properties");
            return null;
        }

        try {
            var props = feature.getProperties();
            var geometry = feature.getGeometry();

            AutocompleteSuggestion.AutocompleteSuggestionBuilder builder = AutocompleteSuggestion.builder()
                    .placeId(props.getPlaceId())
                    .text(props.getName() != null ? props.getName() : props.getFormatted())
                    .formattedAddress(props.getFormatted())
                    .type(props.getResultType());

            if (geometry != null && geometry.getCoordinates() != null && geometry.getCoordinates().size() >= 2) {
                builder.longitude(geometry.getCoordinates().get(0));
                builder.latitude(geometry.getCoordinates().get(1));
            } else {
                builder.longitude(0.0);  // 🔴 FIXED: Set default values
                builder.latitude(0.0);
            }

            return builder.build();

        } catch (Exception e) {
            log.error("Error mapping autocomplete feature to DTO: {}", e.getMessage());
            return null;
        }
    }

    // 🔴 FIXED: This method should be in the interface, but if not, keep it here
    // If it's not in the interface, consider adding it or making it private
    public double[] getCoordinates(String location) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://api.geoapify.com/v1/geocode/search")
                    .queryParam("text", location)
                    .queryParam("apiKey", apiKey)
                    .queryParam("limit", 1)
                    .build()
                    .toUriString();

            GeoapifyResponse response = restTemplate.getForObject(url, GeoapifyResponse.class);

            if (response != null && response.getFeatures() != null && !response.getFeatures().isEmpty()) {
                var feature = response.getFeatures().get(0);
                if (feature.getGeometry() != null && feature.getGeometry().getCoordinates() != null
                        && feature.getGeometry().getCoordinates().size() >= 2) {
                    var coords = feature.getGeometry().getCoordinates();
                    return new double[]{coords.get(1), coords.get(0)}; // [lat, lon]
                }
            }
        } catch (Exception e) {
            log.error("Error getting coordinates for {}: {}", location, e.getMessage());
        }
        return new double[]{0, 0};
    }
}