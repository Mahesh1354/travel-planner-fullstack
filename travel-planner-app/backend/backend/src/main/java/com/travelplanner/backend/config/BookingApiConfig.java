package com.travelplanner.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@Data
public class BookingApiConfig {

    // Flight API Configuration
    @Value("${flight.api.base-url:https://api.mockflight.com/v1}")
    private String flightApiBaseUrl;

    @Value("${flight.api.key:mock-flight-api-key}")
    private String flightApiKey;

    @Value("${flight.api.timeout:5000}")
    private int flightApiTimeout;

    // Accommodation API Configuration
    @Value("${accommodation.api.base-url:https://api.mockaccommodation.com/v1}")
    private String accommodationApiBaseUrl;

    @Value("${accommodation.api.key:mock-accommodation-api-key}")
    private String accommodationApiKey;

    @Value("${accommodation.api.timeout:5000}")
    private int accommodationApiTimeout;

    // Activity API Configuration
    @Value("${activity.api.base-url:https://api.mockactivity.com/v1}")
    private String activityApiBaseUrl;

    @Value("${activity.api.key:mock-activity-api-key}")
    private String activityApiKey;

    @Value("${activity.api.timeout:5000}")
    private int activityApiTimeout;
}