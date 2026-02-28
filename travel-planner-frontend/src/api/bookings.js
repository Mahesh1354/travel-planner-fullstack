import apiClient from './client';

export const bookingsAPI = {
  // 6.1 Search airports
  searchAirports: (keyword) => 
    apiClient.get(`/bookings/search/airports?keyword=${encodeURIComponent(keyword)}`),

  // 6.2 Search flights
  searchFlights: (searchData) => 
    apiClient.post('/bookings/search/flights', searchData),

  // 6.3 Search accommodations/hotels
  searchAccommodations: (searchData) => 
    apiClient.post('/bookings/search/accommodations', searchData),

  // 6.3 Alt: Search hotels (alias for accommodations)
  searchHotels: (searchData) => 
    apiClient.post('/bookings/search/accommodations', searchData),

  // 6.3 Search activities
  searchActivities: (searchData) => 
    apiClient.post('/bookings/search/activities', searchData),

  // 6.4 Create booking
  createBooking: (bookingData) => 
    apiClient.post('/bookings/create', bookingData),

  // 6.5 Get booking status
  getBookingStatus: (bookingReference) => 
    apiClient.get(`/bookings/${bookingReference}`),

  // 6.6 Get all user bookings
  getUserBookings: () => 
    apiClient.get('/bookings'),

  // 6.7 Get trip bookings
  getTripBookings: (tripId) => 
    apiClient.get(`/bookings/trip/${tripId}`),

  // Link booking to destination
  linkBookingToDestination: (bookingReference, destinationId) => 
    apiClient.post(`/bookings/${bookingReference}/link-to-destination/${destinationId}`),

  // Cancel booking
  cancelBooking: (bookingReference) => 
    apiClient.post(`/bookings/${bookingReference}/cancel`),
};

export default bookingsAPI;