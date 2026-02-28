import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { destinationsAPI } from '../api/destinations';
import tripsAPI from '../api/trips';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeftIcon, MapPinIcon, CalendarIcon, HomeIcon, PencilIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';

const EditDestinationPage = () => {
  const { id: tripId, destinationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    arrivalDate: new Date(),
    departureDate: new Date(),
    accommodationName: '',
    accommodationAddress: '',
    notes: '',
  });

  // Fetch trip details for date range validation
  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const response = await tripsAPI.getTrip(tripId);
      return response.data;
    },
  });

  // Fetch destination details
  const { data: destination, isLoading: destLoading } = useQuery({
    queryKey: ['destination', destinationId],
    queryFn: async () => {
      // Note: You might need to fetch all destinations and find the one
      // or create a getDestinationById endpoint
      const response = await destinationsAPI.getDestinations(tripId);
      const dest = response.data?.data?.find(d => d.id === parseInt(destinationId));
      if (!dest) throw new Error('Destination not found');
      return dest;
    },
    enabled: !!tripId && !!destinationId,
  });

  // Populate form when destination data is loaded
  useEffect(() => {
    if (destination) {
      setFormData({
        name: destination.name || '',
        country: destination.country || '',
        city: destination.city || '',
        arrivalDate: destination.arrivalDate ? new Date(destination.arrivalDate) : new Date(),
        departureDate: destination.departureDate ? new Date(destination.departureDate) : new Date(),
        accommodationName: destination.accommodationName || '',
        accommodationAddress: destination.accommodationAddress || '',
        notes: destination.notes || '',
      });
    }
  }, [destination]);

  // Update destination mutation
  const updateDestinationMutation = useMutation({
    mutationFn: (data) => destinationsAPI.updateDestination(destinationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations', tripId] });
      toast.success('Destination updated successfully!');
      navigate(`/trip/${tripId}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update destination');
    },
  });

  // Delete destination mutation
  const deleteDestinationMutation = useMutation({
    mutationFn: () => destinationsAPI.deleteDestination(destinationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations', tripId] });
      toast.success('Destination deleted successfully!');
      navigate(`/trip/${tripId}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete destination');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate dates are within trip dates
    const tripStart = new Date(trip?.data?.startDate);
    const tripEnd = new Date(trip?.data?.endDate);
    const arrival = new Date(formData.arrivalDate);
    const departure = new Date(formData.departureDate);

    // Reset time to midnight for accurate date comparison
    tripStart.setHours(0, 0, 0, 0);
    tripEnd.setHours(0, 0, 0, 0);
    arrival.setHours(0, 0, 0, 0);
    departure.setHours(0, 0, 0, 0);

    if (arrival < tripStart || departure > tripEnd) {
      toast.error('Destination dates must be within your trip dates');
      return;
    }

    if (departure <= arrival) {
      toast.error('Departure date must be after arrival date');
      return;
    }

    updateDestinationMutation.mutate({
      ...formData,
      arrivalDate: formData.arrivalDate.toISOString().split('T')[0],
      departureDate: formData.departureDate.toISOString().split('T')[0],
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
      deleteDestinationMutation.mutate();
    }
  };

  if (tripLoading || destLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Destination not found</h2>
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="btn-primary"
          >
            Back to Trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-2xl">
        <button
          onClick={() => navigate(`/trip/${tripId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Trip Details
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Destination
            </h1>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
              disabled={deleteDestinationMutation.isPending}
            >
              {deleteDestinationMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Trip: {trip?.data?.title} | {new Date(trip?.data?.startDate).toLocaleDateString()} - {new Date(trip?.data?.endDate).toLocaleDateString()}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Destination Name */}
            <div>
              <label htmlFor="name" className="input-label">
                Destination Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="e.g., Paris, Tokyo, New York"
                />
              </div>
            </div>

            {/* Country & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="input-label">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="France"
                />
              </div>
              <div>
                <label htmlFor="city" className="input-label">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Paris"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="arrivalDate" className="input-label">
                  Arrival Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <DatePicker
                    id="arrivalDate"
                    selected={formData.arrivalDate}
                    onChange={(date) => setFormData(prev => ({ ...prev, arrivalDate: date }))}
                    minDate={new Date(trip?.data?.startDate)}
                    maxDate={new Date(trip?.data?.endDate)}
                    className="input-field pl-10"
                    dateFormat="MMMM d, yyyy"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="departureDate" className="input-label">
                  Departure Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <DatePicker
                    id="departureDate"
                    selected={formData.departureDate}
                    onChange={(date) => setFormData(prev => ({ ...prev, departureDate: date }))}
                    minDate={formData.arrivalDate}
                    maxDate={new Date(trip?.data?.endDate)}
                    className="input-field pl-10"
                    dateFormat="MMMM d, yyyy"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Accommodation */}
            <div>
              <label htmlFor="accommodationName" className="input-label">
                Accommodation Name
              </label>
              <div className="relative">
                <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="accommodationName"
                  name="accommodationName"
                  value={formData.accommodationName}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Hotel name (optional)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="accommodationAddress" className="input-label">
                Accommodation Address
              </label>
              <input
                type="text"
                id="accommodationAddress"
                name="accommodationAddress"
                value={formData.accommodationAddress}
                onChange={handleChange}
                className="input-field"
                placeholder="Full address (optional)"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="input-label">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="input-field"
                placeholder="Any special notes about this destination? (optional)"
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/trip/${tripId}`)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateDestinationMutation.isPending}
                className="flex-1 btn-primary"
              >
                {updateDestinationMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : 'Update Destination'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDestinationPage;