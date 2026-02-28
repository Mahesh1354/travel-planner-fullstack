package com.travelplanner.backend.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class WeatherEvent extends ApplicationEvent {

    private final Long tripId;
    private final String destination;
    private final String weatherMessage;
    private final String userEmail;

    public WeatherEvent(Object source, Long tripId, String destination,
                        String weatherMessage, String userEmail) {
        super(source);
        this.tripId = tripId;
        this.destination = destination;
        this.weatherMessage = weatherMessage;
        this.userEmail = userEmail;
    }
}