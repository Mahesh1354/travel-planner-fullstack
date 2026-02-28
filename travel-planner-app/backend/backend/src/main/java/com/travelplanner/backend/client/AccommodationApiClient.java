package com.travelplanner.backend.client;

import com.travelplanner.backend.dto.request.AccommodationSearchRequest;
import com.travelplanner.backend.dto.response.AccommodationSearchResponse;
import com.travelplanner.backend.dto.response.BookingConfirmationResponse;

public interface AccommodationApiClient {

    AccommodationSearchResponse searchAccommodations(AccommodationSearchRequest request);

    BookingConfirmationResponse bookAccommodation(String accommodationId, String guestDetails, String paymentInfo);

    BookingConfirmationResponse getAccommodationBookingStatus(String bookingReference);

    boolean cancelAccommodationBooking(String bookingReference);
}