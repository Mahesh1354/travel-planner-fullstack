package com.travelplanner.backend.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class BookingEvent extends ApplicationEvent {

    private final Long tripId;
    private final String bookingReference;
    private final String bookingType;
    private final String userEmail;
    private final EventType eventType;

    public enum EventType {
        CREATED, CANCELLED, UPDATED
    }

    public BookingEvent(Object source, Long tripId, String bookingReference,
                        String bookingType, String userEmail, EventType eventType) {
        super(source);
        this.tripId = tripId;
        this.bookingReference = bookingReference;
        this.bookingType = bookingType;
        this.userEmail = userEmail;
        this.eventType = eventType;
    }
}