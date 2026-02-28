package com.travelplanner.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching  // Add this annotation to enable caching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                // Amadeus caches
                "flightOffers",
                "airports",
                "hotelOffers",
                // Weather caches
                "currentWeather",
                "forecast",
                // Places caches
                "places",
                "placeDetails",
                "autocomplete"
        );

        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)  // 1 hour for Amadeus data
                .maximumSize(500)
                .recordStats());

        return cacheManager;
    }
}