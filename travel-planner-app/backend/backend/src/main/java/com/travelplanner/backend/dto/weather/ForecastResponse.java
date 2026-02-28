package com.travelplanner.backend.dto.weather;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ForecastResponse {
    private String cod;
    private int message;
    private int cnt;
    private List<ForecastItem> list;
    private City city;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ForecastItem {
        private long dt;
        private Main main;
        private List<Weather> weather;
        private Clouds clouds;
        private Wind wind;
        private int visibility;
        private double pop;
        private Rain rain;
        private Snow snow;
        private Sys sys;
        private String dtTxt;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Main {
        private double temp;
        private double feelsLike;
        private double tempMin;
        private double tempMax;
        private int pressure;
        private int seaLevel;
        private int grndLevel;
        private int humidity;
        private double tempKf;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Weather {
        private int id;
        private String main;
        private String description;
        private String icon;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Clouds {
        private int all;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Wind {
        private double speed;
        private int deg;
        private double gust;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Rain {
        private double _1h;
        private double _3h;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Snow {
        private double _1h;
        private double _3h;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class City {
        private long id;
        private String name;
        private Coord coord;
        private String country;
        private long population;
        private int timezone;
        private long sunrise;
        private long sunset;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Coord {
        private double lon;
        private double lat;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Sys {
        private String pod;
    }
}