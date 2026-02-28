package com.travelplanner.backend.client;

import com.travelplanner.backend.dto.request.ActivitySearchRequest;
import com.travelplanner.backend.dto.response.ActivitySearchResponse;
import com.travelplanner.backend.dto.response.BookingConfirmationResponse;

public interface ActivityApiClient {

    ActivitySearchResponse searchActivities(ActivitySearchRequest request);

    BookingConfirmationResponse bookActivity(String activityId, String participantDetails, String paymentInfo);

    BookingConfirmationResponse getActivityBookingStatus(String bookingReference);

    boolean cancelActivityBooking(String bookingReference);
}