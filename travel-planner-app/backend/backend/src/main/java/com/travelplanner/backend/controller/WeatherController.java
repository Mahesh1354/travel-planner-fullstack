package com.travelplanner.backend.controller;

import com.travelplanner.backend.dto.response.MessageResponse;
import com.travelplanner.backend.dto.weather.ForecastDTO;
import com.travelplanner.backend.dto.weather.WeatherDTO;
import com.travelplanner.backend.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentWeather(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String city) {
        try {
            WeatherDTO weather = weatherService.getCurrentWeather(city);
            return ResponseEntity.ok(weather);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/current/coordinates")
    public ResponseEntity<?> getCurrentWeatherByCoordinates(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam double lat,
            @RequestParam double lon) {
        try {
            WeatherDTO weather = weatherService.getCurrentWeatherByCoordinates(lat, lon);
            return ResponseEntity.ok(weather);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/forecast")
    public ResponseEntity<?> getForecast(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String city,
            @RequestParam(defaultValue = "5") int days) {
        try {
            ForecastDTO forecast = weatherService.getForecast(city, days);
            return ResponseEntity.ok(forecast);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/forecast/coordinates")
    public ResponseEntity<?> getForecastByCoordinates(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "5") int days) {
        try {
            ForecastDTO forecast = weatherService.getForecastByCoordinates(lat, lon, days);
            return ResponseEntity.ok(forecast);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchCities(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String query) {
        try {
            List<String> cities = weatherService.searchCities(query);
            return ResponseEntity.ok(cities);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/alert")
    public ResponseEntity<?> checkWeatherAlert(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String city,
            @RequestParam double thresholdTemp,
            @RequestParam double thresholdWind) {
        try {
            boolean alert = weatherService.isWeatherAlert(city, thresholdTemp, thresholdWind);
            return ResponseEntity.ok(new MessageResponse(
                    alert ? "Weather alert triggered" : "Weather conditions normal",
                    alert
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage(), false));
        }
    }
}