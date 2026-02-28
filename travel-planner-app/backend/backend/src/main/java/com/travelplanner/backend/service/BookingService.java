package com.travelplanner.backend.service;

import com.travelplanner.backend.dto.request.BookingRequest;
import com.travelplanner.backend.dto.response.BookingConfirmationResponse;
import com.travelplanner.backend.dto.response.BookingDTO;
import com.travelplanner.backend.entity.Booking;
import java.util.List;

public interface BookingService {

    BookingConfirmationResponse createBooking(String userEmail, BookingRequest request);

    BookingConfirmationResponse getBookingStatus(String bookingReference, String userEmail);

    List<BookingDTO> getUserBookings(String userEmail);

    List<BookingDTO> getTripBookings(Long tripId, String userEmail);

    BookingConfirmationResponse cancelBooking(String bookingReference, String userEmail);

    BookingConfirmationResponse addBookingToTrip(String bookingReference, Long tripId, String userEmail);

    BookingConfirmationResponse addBookingToDestination(String bookingReference, Long destinationId, String userEmail);

    BookingConfirmationResponse addBookingToActivity(String bookingReference, Long activityId, String userEmail);
}