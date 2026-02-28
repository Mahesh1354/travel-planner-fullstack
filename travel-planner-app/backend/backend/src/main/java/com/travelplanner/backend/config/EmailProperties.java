package com.travelplanner.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.email")
@Data
public class EmailProperties {
    private String from;
    private String fromName;
    private boolean enabled = true;
    private String baseUrl = "http://localhost:5173";
}