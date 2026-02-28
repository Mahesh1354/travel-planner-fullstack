package com.travelplanner.backend.dto.places;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeoapifyResponse {
    private String type;
    private List<Feature> features;
    private Map<String, Object> query;  // Changed from Query object to Map for simplicity

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Feature {
        private String type;
        private Properties properties;
        private Geometry geometry;
        private Map<String, Object> bbox;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Properties {
        private String name;
        private String street;
        private String housenumber;
        private String postcode;
        private String city;
        private String country;
        private String country_code;
        private String formatted;
        private String place_id;
        private List<String> categories;
        private String website;
        private String phone;
        private String opening_hours;
        private String icon;
        private String lon;
        private String lat;
        private String state;
        private String suburb;
        private String district;
        private String city_block;
        private String quarter;
        private String address_line1;
        private String address_line2;
        private String description;
        private String ref;
        private Double distance;

        // 🔴 FIXED: datasource is an object, not a string
        private DataSource datasource;

        private Map<String, Object> name_international;
        private Map<String, Object> name_other;
        private Map<String, Object> contact;
        private Map<String, Object> facilities;
        private Map<String, Object> wiki_and_media;
        private Map<String, Object> building;
        private Map<String, Object> artwork;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DataSource {
        private String sourcename;
        private String attribution;
        private String license;
        private String url;
        private Map<String, Object> raw;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Geometry {
        private String type;
        private List<Double> coordinates;
    }
}