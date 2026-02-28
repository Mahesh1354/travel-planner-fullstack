package com.travelplanner.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class NotificationSchedulerConfig {
    // Scheduling is enabled via @EnableScheduling
    // The actual scheduled tasks are in NotificationServiceImpl with @Scheduled annotations
}