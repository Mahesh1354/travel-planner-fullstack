package com.travelplanner.backend.dto.weather;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AirPollutionResponse {
    private Coord coord;
    private List<ListItem> list;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Coord {
        private double lon;
        private double lat;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ListItem {
        private long dt;
        private Main main;
        private Components components;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Main {
        private int aqi;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Components {
        private double co;
        private double no;
        private double no2;
        private double o3;
        private double so2;
        private double pm2_5;
        private double pm10;
        private double nh3;
    }
}