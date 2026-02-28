package com.travelplanner.backend.dto.places;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeoapifyAutocompleteResponse {
    private List<AutocompleteFeature> features;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AutocompleteFeature {
        private String type;
        private AutocompleteProperties properties;
        private AutocompleteGeometry geometry;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AutocompleteProperties {
        private String placeId;
        private String formatted;
        private String name;
        private String city;
        private String country;
        private String addressLine1;
        private String addressLine2;
        private String category;
        private String resultType;  // city, address, place, etc.
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AutocompleteGeometry {
        private String type;
        private List<Double> coordinates;
    }
}