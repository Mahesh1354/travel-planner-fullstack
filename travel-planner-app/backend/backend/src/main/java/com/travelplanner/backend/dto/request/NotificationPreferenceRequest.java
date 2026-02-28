package com.travelplanner.backend.dto.request;

import lombok.Data;
import java.time.LocalTime;

@Data
public class NotificationPreferenceRequest {

    private Boolean flightUpdates;
    private Boolean weatherAlerts;
    private Boolean groupActivities;
    private Boolean bookingConfirmations;
    private Boolean paymentReminders;
    private Boolean promotional;
    private Boolean emailEnabled;
    private Boolean pushEnabled;
    private Boolean smsEnabled;
    private LocalTime quietHoursStart;
    private LocalTime quietHoursEnd;
}