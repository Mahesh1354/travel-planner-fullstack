package com.travelplanner.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@Data
public class RecommendationApiConfig {

    @Value("${recommendation.api.base-url:https://api.mockrecommendations.com/v1}")
    private String baseUrl;

    @Value("${recommendation.api.key:mock-recommendation-api-key}")
    private String apiKey;

    @Value("${recommendation.api.timeout:5000}")
    private int timeout;

    @Value("${recommendation.cache.duration:86400}") // 24 hours in seconds
    private int cacheDuration;
}