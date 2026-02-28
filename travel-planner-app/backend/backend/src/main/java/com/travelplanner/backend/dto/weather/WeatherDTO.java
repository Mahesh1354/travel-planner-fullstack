package com.travelplanner.backend.dto.weather;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class WeatherDTO {
    private String cityName;
    private String country;
    private double latitude;
    private double longitude;
    private double temperature;
    private double feelsLike;
    private double tempMin;
    private double tempMax;
    private int humidity;
    private double pressure;
    private double windSpeed;
    private int windDeg;
    private String weatherMain;
    private String weatherDescription;
    private String weatherIcon;
    private int visibility;
    private long sunrise;
    private long sunset;
    private LocalDateTime timestamp;
    private AirQuality airQuality;

    @Data
    @Builder
    public static class AirQuality {
        private int aqi;
        private double co;
        private double no2;
        private double o3;
        private double so2;
        private double pm2_5;
        private double pm10;
    }

    public String getAqiDescription() {
        if (airQuality == null) return "Unknown";
        switch (airQuality.getAqi()) {
            case 1: return "Good";
            case 2: return "Fair";
            case 3: return "Moderate";
            case 4: return "Poor";
            case 5: return "Very Poor";
            default: return "Unknown";
        }
    }
}