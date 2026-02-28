package com.travelplanner.backend.dto.weather;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ForecastDTO {
    private String cityName;
    private String country;
    private List<ForecastDay> daily;
    private List<ForecastHour> hourly;

    @Data
    @Builder
    public static class ForecastDay {
        private LocalDateTime date;
        private double tempDay;
        private double tempNight;
        private double tempMin;
        private double tempMax;
        private int humidity;
        private double windSpeed;
        private String weatherMain;
        private String weatherDescription;
        private String weatherIcon;
        private double pop; // Probability of precipitation
    }

    @Data
    @Builder
    public static class ForecastHour {
        private LocalDateTime time;
        private double temperature;
        private int humidity;
        private double windSpeed;
        private String weatherMain;
        private String weatherDescription;
        private String weatherIcon;
    }
}