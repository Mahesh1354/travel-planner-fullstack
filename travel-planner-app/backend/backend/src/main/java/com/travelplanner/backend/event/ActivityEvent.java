package com.travelplanner.backend.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ActivityEvent extends ApplicationEvent {

    private final Long tripId;
    private final String activityName;
    private final String updatedBy;
    private final String userEmail;
    private final EventType eventType;

    public enum EventType {
        ADDED, UPDATED, DELETED
    }

    public ActivityEvent(Object source, Long tripId, String activityName,
                         String updatedBy, String userEmail, EventType eventType) {
        super(source);
        this.tripId = tripId;
        this.activityName = activityName;
        this.updatedBy = updatedBy;
        this.userEmail = userEmail;
        this.eventType = eventType;
    }
}