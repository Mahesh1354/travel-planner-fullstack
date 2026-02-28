package com.travelplanner.backend.config;

import com.amadeus.Amadeus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.annotation.EnableCaching;

@Configuration
@EnableCaching
public class AmadeusConfig {

    @Value("${amadeus.client.id}")
    private String clientId;

    @Value("${amadeus.client.secret}")
    private String clientSecret;

    @Value("${amadeus.api.url}")
    private String apiUrl;

    @Bean
    public Amadeus amadeus() {
        // Extract just the hostname from the URL
        String host = apiUrl.replace("https://", "").replace("http://", "");

        return Amadeus
                .builder(clientId, clientSecret)
                .setHost(host)  // Now it's just "test.api.amadeus.com"
                .build();
    }
}