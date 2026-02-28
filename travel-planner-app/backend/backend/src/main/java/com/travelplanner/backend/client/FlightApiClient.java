package com.travelplanner.backend.client;

import com.travelplanner.backend.dto.request.FlightSearchRequest;
import com.travelplanner.backend.dto.response.FlightSearchResponse;
import com.travelplanner.backend.dto.response.BookingConfirmationResponse;

public interface FlightApiClient {

    FlightSearchResponse searchFlights(FlightSearchRequest request);

    BookingConfirmationResponse bookFlight(String flightId, String passengerDetails, String paymentInfo);

    BookingConfirmationResponse getFlightBookingStatus(String bookingReference);

    boolean cancelFlightBooking(String bookingReference);
}