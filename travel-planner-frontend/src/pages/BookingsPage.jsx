import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bookingsAPI from '../api/bookings';
import tripsAPI from '../api/trips';
import BookingSearchTabs from '../components/bookings/BookingSearchTabs';
import FlightSearchForm from '../components/bookings/FlightSearchForm';
import HotelSearchForm from '../components/bookings/HotelSearchForm';
import ActivitySearchForm from '../components/bookings/ActivitySearchForm';
import SearchResults from '../components/bookings/SearchResults';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Mock search results for demonstration (keep as fallback)
const mockSearchResults = {
  flights: [
    {
      id: 'fl1',
      airline: {
        name: 'Emirates',
        logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=50&auto=format',
      },
      flightNumber: 'EK123',
      departure: { time: '10:30', airport: 'JFK' },
      arrival: { time: '23:45', airport: 'DXB' },
      duration: 735,
      stops: 0,
      price: 850,
      rating: 4.5,
    },
    {
      id: 'fl2',
      airline: {
        name: 'Qatar Airways',
        logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=50&auto=format',
      },
      flightNumber: 'QR704',
      departure: { time: '22:15', airport: 'JFK' },
      arrival: { time: '19:30', airport: 'DOH' },
      duration: 810,
      stops: 1,
      price: 720,
      rating: 4.3,
    },
  ],
  hotels: [
    {
      id: 'ht1',
      name: 'Grand Plaza Hotel',
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format',
      pricePerNight: 299,
      rating: 4.5,
      reviews: 1234,
      amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
    },
    {
      id: 'ht2',
      name: 'Seaside Resort & Spa',
      location: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&auto=format',
      pricePerNight: 189,
      rating: 4.7,
      reviews: 856,
      amenities: ['Beach Access', 'Pool', 'Spa', 'Free Breakfast'],
    },
  ],
  activities: [
    {
      id: 'ac1',
      name: 'Eiffel Tower Summit Access',
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=200&auto=format',
      price: 45,
      duration: 120,
      rating: 4.8,
      description: 'Skip-the-line access to the Eiffel Tower summit with guided tour',
    },
    {
      id: 'ac2',
      name: 'Traditional Cooking Class',
      location: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200&auto=format',
      price: 65,
      duration: 180,
      rating: 4.9,
      description: 'Learn to cook authentic Balinese dishes with a local chef',
    },
  ],
};

const BookingsPage = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('flights');
  const [searchResults, setSearchResults] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch trip details
  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const response = await tripsAPI.getTrip(tripId);
      return response.data;
    },
    enabled: !!tripId,
  });

  // Fetch user's bookings
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['bookings', tripId],
    queryFn: async () => {
      try {
        const response = await bookingsAPI.getTripBookings(tripId);
        // Handle different response formats
        return response.data || [];
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return [];
      }
    },
    enabled: !!tripId,
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: ({ type, data }) => {
      switch (type) {
        case 'flights':
          return bookingsAPI.searchFlights(data);
        case 'hotels':
          return bookingsAPI.searchAccommodations(data);
        case 'activities':
          return bookingsAPI.searchActivities(data);
        default:
          throw new Error('Invalid search type');
      }
    },
    onSuccess: (response, variables) => {
      console.log('Search response:', response);
      
      // Handle the response format from your API
      let results = [];
      
      // Check if response.data exists and has the appropriate property
      if (response.data) {
        if (variables.type === 'flights' && response.data.flights) {
          results = response.data.flights;
        } else if (variables.type === 'hotels' && response.data.accommodations) {
          results = response.data.accommodations;
        } else if (variables.type === 'activities' && response.data.activities) {
          results = response.data.activities;
        } else if (Array.isArray(response.data)) {
          // If response.data is directly an array
          results = response.data;
        }
      }
      
      // If no results found, show message
      if (!results || results.length === 0) {
        toast('No results found for your search criteria', {
          icon: 'ℹ️',
          duration: 4000,
        });
      }
      
      setSearchResults(results);
      setSearchLoading(false);
    },
    onError: (error) => {
      console.error('Search error:', error);
      toast.error('Search failed. Using mock data.');
      // Fallback to mock data
      setSearchResults(mockSearchResults[activeTab]);
      setSearchLoading(false);
    },
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (bookingData) => bookingsAPI.createBooking(bookingData),
    onSuccess: (response) => {
      toast.success('Booking created successfully!');
      // Refresh bookings list
      refetchBookings();
      queryClient.invalidateQueries({ queryKey: ['bookings', tripId] });
    },
    onError: (error) => {
      console.error('Booking creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    },
  });

  const handleSearch = (searchData) => {
    setSearchPerformed(true);
    setSearchLoading(true);
    setSearchResults(null);

    // Call the API
    searchMutation.mutate({ 
      type: activeTab, 
      data: searchData 
    });
  };

  const handleSelect = (item) => {
    toast.success(`${item.name || item.airline?.name || item.hotelName || 'Item'} saved to your trip!`);
    // Here you could implement saving to wishlist or itinerary
  };

  const handleBook = (item) => {
    // Extract price based on item type
    let price = item.price;
    if (activeTab === 'hotels') {
      price = item.pricePerNight;
    }
    
    const bookingData = {
      itemId: item.id || item.hotelId,
      bookingType: activeTab === 'hotels' ? 'ACCOMMODATION' : activeTab.toUpperCase().slice(0, -1),
      passengerDetails: JSON.stringify({ 
        name: 'John Doe',
        email: 'john.doe@example.com' 
      }),
      paymentInfo: JSON.stringify({ 
        method: 'mock-payment',
        cardLast4: '4242' 
      }),
      tripId: parseInt(tripId),
      // Add item details for better tracking
      itemDetails: {
        name: item.name || item.hotelName || item.airline?.name,
        price: price,
        currency: item.currency || 'USD'
      }
    };

    createBookingMutation.mutate(bookingData);
  };

  if (tripLoading || bookingsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Extract trip data correctly
  const tripData = trip || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Trip Details
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {tripData?.title || 'Trip'} - Bookings
          </h1>
          <p className="text-gray-600">
            Search and book flights, hotels, and activities for your trip
          </p>
        </div>

        {/* Search Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <BookingSearchTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="p-6">
            {activeTab === 'flights' && (
              <FlightSearchForm onSearch={handleSearch} />
            )}
            {activeTab === 'hotels' && (
              <HotelSearchForm onSearch={handleSearch} />
            )}
            {activeTab === 'activities' && (
              <ActivitySearchForm onSearch={handleSearch} />
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchPerformed && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Search Results
              </h2>
              {searchLoading && (
                <span className="text-sm text-gray-500">Searching...</span>
              )}
            </div>
            
            {searchLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : searchResults ? (
              searchResults.length > 0 ? (
                <SearchResults
                  results={searchResults}
                  type={activeTab}
                  onSelect={handleSelect}
                  onBook={handleBook}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No results found. Try adjusting your search criteria.
                </div>
              )
            ) : null}
          </div>
        )}

        {/* Existing Bookings */}
        {bookings && bookings.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Bookings
            </h2>
            
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">
                          {booking.bookingType === 'FLIGHT' ? '✈️' : 
                           booking.bookingType === 'ACCOMMODATION' ? '🏨' : '🎯'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.bookingType}: {booking.bookingReference}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.itemDetails?.name || 'Booking details'}
                        </p>
                        {booking.totalPrice && (
                          <p className="text-xs text-gray-400">
                            {booking.currency || 'USD'} {booking.totalPrice}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status || 'CONFIRMED'}
                      </span>
                      <button 
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;