package com.travelplanner.backend.service;

import com.travelplanner.backend.dto.weather.WeatherDTO;
import com.travelplanner.backend.dto.weather.ForecastDTO;
import java.util.List;

public interface WeatherService {

    WeatherDTO getCurrentWeather(String city);

    WeatherDTO getCurrentWeatherByCoordinates(double lat, double lon);

    ForecastDTO getForecast(String city, int days);

    ForecastDTO getForecastByCoordinates(double lat, double lon, int days);

    List<String> searchCities(String query);

    boolean isWeatherAlert(String city, double thresholdTemp, double thresholdWind);
}