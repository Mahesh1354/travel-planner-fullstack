package com.travelplanner.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.backend.dto.weather.*;
import com.travelplanner.backend.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherServiceImpl implements WeatherService {

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.url}")
    private String apiUrl;

    @Value("${weather.api.units:metric}")
    private String units;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Cacheable(value = "currentWeather", key = "#city", unless = "#result == null")
    public WeatherDTO getCurrentWeather(String city) {
        log.info("Fetching current weather for city: {}", city);

        try {
            String url = UriComponentsBuilder.fromHttpUrl(apiUrl + "/weather")
                    .queryParam("q", city)
                    .queryParam("appid", apiKey)
                    .queryParam("units", units)
                    .build()
                    .toUriString();

            ResponseEntity<WeatherResponse> response = restTemplate.getForEntity(url, WeatherResponse.class);

            if (response.getBody() == null) {
                throw new RuntimeException("No weather data received for city: " + city);
            }

            WeatherDTO weatherDTO = mapToWeatherDTO(response.getBody());

            // Fetch air quality data using coordinates
            try {
                WeatherDTO.AirQuality airQuality = fetchAirQuality(
                        response.getBody().getCoord().getLat(),
                        response.getBody().getCoord().getLon()
                );
                weatherDTO.setAirQuality(airQuality);
            } catch (Exception e) {
                log.warn("Could not fetch air quality data: {}", e.getMessage());
            }

            return weatherDTO;

        } catch (RestClientException e) {
            log.error("Error fetching weather data for city {}: {}", city, e.getMessage());
            throw new RuntimeException("Failed to fetch weather data: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "currentWeather", key = "#lat + ',' + #lon", unless = "#result == null")
    public WeatherDTO getCurrentWeatherByCoordinates(double lat, double lon) {
        log.info("Fetching current weather for coordinates: {}, {}", lat, lon);

        try {
            String url = UriComponentsBuilder.fromHttpUrl(apiUrl + "/weather")
                    .queryParam("lat", lat)
                    .queryParam("lon", lon)
                    .queryParam("appid", apiKey)
                    .queryParam("units", units)
                    .build()
                    .toUriString();

            ResponseEntity<WeatherResponse> response = restTemplate.getForEntity(url, WeatherResponse.class);

            if (response.getBody() == null) {
                throw new RuntimeException("No weather data received for coordinates: " + lat + ", " + lon);
            }

            WeatherDTO weatherDTO = mapToWeatherDTO(response.getBody());

            // Fetch air quality data
            try {
                WeatherDTO.AirQuality airQuality = fetchAirQuality(lat, lon);
                weatherDTO.setAirQuality(airQuality);
            } catch (Exception e) {
                log.warn("Could not fetch air quality data: {}", e.getMessage());
            }

            return weatherDTO;

        } catch (RestClientException e) {
            log.error("Error fetching weather data for coordinates {},{}: {}", lat, lon, e.getMessage());
            throw new RuntimeException("Failed to fetch weather data: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "forecast", key = "#city + '-' + #days", unless = "#result == null")
    public ForecastDTO getForecast(String city, int days) {
        log.info("Fetching {} day forecast for city: {}", days, city);

        try {
            // First get coordinates for the city
            WeatherDTO current = getCurrentWeather(city);

            return getForecastByCoordinates(current.getLatitude(), current.getLongitude(), days);

        } catch (Exception e) {
            log.error("Error fetching forecast for city {}: {}", city, e.getMessage());
            throw new RuntimeException("Failed to fetch forecast: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "forecast", key = "#lat + ',' + #lon + '-' + #days", unless = "#result == null")
    public ForecastDTO getForecastByCoordinates(double lat, double lon, int days) {
        log.info("Fetching {} day forecast for coordinates: {}, {}", days, lat, lon);

        try {
            String url = UriComponentsBuilder.fromHttpUrl(apiUrl + "/forecast")
                    .queryParam("lat", lat)
                    .queryParam("lon", lon)
                    .queryParam("appid", apiKey)
                    .queryParam("units", units)
                    .queryParam("cnt", days * 8) // API returns 3-hour intervals, 8 per day
                    .build()
                    .toUriString();

            ResponseEntity<ForecastResponse> response = restTemplate.getForEntity(url, ForecastResponse.class);

            if (response.getBody() == null) {
                throw new RuntimeException("No forecast data received");
            }

            return mapToForecastDTO(response.getBody());

        } catch (RestClientException e) {
            log.error("Error fetching forecast for coordinates {},{}: {}", lat, lon, e.getMessage());
            throw new RuntimeException("Failed to fetch forecast: " + e.getMessage());
        }
    }

    @Override
    public List<String> searchCities(String query) {
        log.info("Searching cities with query: {}", query);

        try {
            String url = UriComponentsBuilder.fromHttpUrl("http://api.openweathermap.org/geo/1.0/direct")
                    .queryParam("q", query)
                    .queryParam("limit", 5)
                    .queryParam("appid", apiKey)
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            List<String> cities = new ArrayList<>();
            for (JsonNode node : root) {
                String name = node.get("name").asText();
                String country = node.get("country").asText();
                cities.add(name + ", " + country);
            }

            return cities;

        } catch (Exception e) {
            log.error("Error searching cities: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public boolean isWeatherAlert(String city, double thresholdTemp, double thresholdWind) {
        try {
            WeatherDTO weather = getCurrentWeather(city);

            boolean tempAlert = weather.getTemperature() > thresholdTemp;
            boolean windAlert = weather.getWindSpeed() > thresholdWind;

            return tempAlert || windAlert;

        } catch (Exception e) {
            log.error("Error checking weather alert: {}", e.getMessage());
            return false;
        }
    }

    private WeatherDTO mapToWeatherDTO(WeatherResponse response) {
        WeatherDTO.WeatherDTOBuilder builder = WeatherDTO.builder()
                .cityName(response.getName())
                .country(response.getSys() != null ? response.getSys().getCountry() : null)
                .latitude(response.getCoord() != null ? response.getCoord().getLat() : 0)
                .longitude(response.getCoord() != null ? response.getCoord().getLon() : 0)
                .temperature(response.getMain().getTemp())
                .feelsLike(response.getMain().getFeelsLike())
                .tempMin(response.getMain().getTempMin())
                .tempMax(response.getMain().getTempMax())
                .humidity(response.getMain().getHumidity())
                .pressure(response.getMain().getPressure())
                .visibility(response.getVisibility())
                .timestamp(LocalDateTime.ofInstant(
                        Instant.ofEpochSecond(response.getDt()),
                        ZoneId.systemDefault()
                ));

        if (response.getWind() != null) {
            builder.windSpeed(response.getWind().getSpeed())
                    .windDeg(response.getWind().getDeg());
        }

        if (response.getWeather() != null && !response.getWeather().isEmpty()) {
            var weather = response.getWeather().get(0);
            builder.weatherMain(weather.getMain())
                    .weatherDescription(weather.getDescription())
                    .weatherIcon(weather.getIcon());
        }

        if (response.getSys() != null) {
            builder.sunrise(response.getSys().getSunrise())
                    .sunset(response.getSys().getSunset());
        }

        return builder.build();
    }

    private ForecastDTO mapToForecastDTO(ForecastResponse response) {
        ForecastDTO.ForecastDTOBuilder builder = ForecastDTO.builder()
                .cityName(response.getCity().getName())
                .country(response.getCity().getCountry());

        List<ForecastDTO.ForecastDay> daily = new ArrayList<>();
        List<ForecastDTO.ForecastHour> hourly = new ArrayList<>();

        // Group by day for daily forecast
        java.util.Map<String, List<ForecastResponse.ForecastItem>> dayGroups = new java.util.HashMap<>();

        for (ForecastResponse.ForecastItem item : response.getList()) {
            LocalDateTime dateTime = LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(item.getDt()),
                    ZoneId.systemDefault()
            );
            String dayKey = dateTime.toLocalDate().toString();

            dayGroups.computeIfAbsent(dayKey, k -> new ArrayList<>()).add(item);

            // Add to hourly forecast
            ForecastDTO.ForecastHour hour = ForecastDTO.ForecastHour.builder()
                    .time(dateTime)
                    .temperature(item.getMain().getTemp())
                    .humidity(item.getMain().getHumidity())
                    .windSpeed(item.getWind() != null ? item.getWind().getSpeed() : 0)
                    .build();

            if (item.getWeather() != null && !item.getWeather().isEmpty()) {
                var weather = item.getWeather().get(0);
                hour.setWeatherMain(weather.getMain());
                hour.setWeatherDescription(weather.getDescription());
                hour.setWeatherIcon(weather.getIcon());
            }

            hourly.add(hour);
        }

        // Calculate daily aggregates
        for (var entry : dayGroups.entrySet()) {
            List<ForecastResponse.ForecastItem> items = entry.getValue();

            double tempSum = items.stream().mapToDouble(i -> i.getMain().getTemp()).average().orElse(0);
            double tempMin = items.stream().mapToDouble(i -> i.getMain().getTempMin()).min().orElse(0);
            double tempMax = items.stream().mapToDouble(i -> i.getMain().getTempMax()).max().orElse(0);
            double humiditySum = items.stream().mapToDouble(i -> i.getMain().getHumidity()).average().orElse(0);
            double windSum = items.stream().mapToDouble(i -> i.getWind() != null ? i.getWind().getSpeed() : 0).average().orElse(0);
            double popSum = items.stream().mapToDouble(i -> i.getPop()).max().orElse(0);

            var firstItem = items.get(0);
            LocalDateTime dateTime = LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(firstItem.getDt()),
                    ZoneId.systemDefault()
            );

            ForecastDTO.ForecastDay day = ForecastDTO.ForecastDay.builder()
                    .date(dateTime)
                    .tempDay(tempSum)
                    .tempNight(tempMin) // Simplified
                    .tempMin(tempMin)
                    .tempMax(tempMax)
                    .humidity((int) humiditySum)
                    .windSpeed(windSum)
                    .pop(popSum)
                    .build();

            if (firstItem.getWeather() != null && !firstItem.getWeather().isEmpty()) {
                var weather = firstItem.getWeather().get(0);
                day.setWeatherMain(weather.getMain());
                day.setWeatherDescription(weather.getDescription());
                day.setWeatherIcon(weather.getIcon());
            }

            daily.add(day);
        }

        return builder.daily(daily)
                .hourly(hourly)
                .build();
    }

    private WeatherDTO.AirQuality fetchAirQuality(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(apiUrl + "/air_pollution")
                .queryParam("lat", lat)
                .queryParam("lon", lon)
                .queryParam("appid", apiKey)
                .build()
                .toUriString();

        ResponseEntity<AirPollutionResponse> response = restTemplate.getForEntity(url, AirPollutionResponse.class);

        if (response.getBody() == null || response.getBody().getList().isEmpty()) {
            return null;
        }

        var item = response.getBody().getList().get(0);
        var components = item.getComponents();

        return WeatherDTO.AirQuality.builder()
                .aqi(item.getMain().getAqi())
                .co(components.getCo())
                .no2(components.getNo2())
                .o3(components.getO3())
                .so2(components.getSo2())
                .pm2_5(components.getPm2_5())
                .pm10(components.getPm10())
                .build();
    }
}