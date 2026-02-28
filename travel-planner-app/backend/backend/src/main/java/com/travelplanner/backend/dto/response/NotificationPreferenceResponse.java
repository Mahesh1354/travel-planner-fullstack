package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceResponse {
    private Long id;
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