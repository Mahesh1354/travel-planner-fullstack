package com.travelplanner.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulerConfig {
    // This enables scheduled methods like @Scheduled in NotificationServiceImpl
}