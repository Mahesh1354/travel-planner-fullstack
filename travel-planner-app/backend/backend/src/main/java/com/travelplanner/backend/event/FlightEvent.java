package com.travelplanner.backend.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class FlightEvent extends ApplicationEvent {

    private final Long tripId;
    private final String flightNumber;
    private final String updateMessage;
    private final String userEmail;

    public FlightEvent(Object source, Long tripId, String flightNumber,
                       String updateMessage, String userEmail) {
        super(source);
        this.tripId = tripId;
        this.flightNumber = flightNumber;
        this.updateMessage = updateMessage;
        this.userEmail = userEmail;
    }
}