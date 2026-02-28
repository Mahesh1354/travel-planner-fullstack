import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { destinationsAPI } from "../api/destinations";
import tripsAPI from "../api/trips";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

const AddDestinationPage = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  console.log("AddDestinationPage - Trip ID from URL:", tripId);

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    arrivalDate: new Date(),
    departureDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    accommodationName: "",
    accommodationAddress: "",
    notes: "",
  });

  // Fetch trip details for date range validation
  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
    refetch: refetchTrip,
  } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      try {
        console.log("Fetching trip with ID:", tripId);
        const response = await tripsAPI.getTrip(tripId);
        console.log("AddDestinationPage - API Response:", response);
        
        // Handle different response formats
        if (response?.data) {
          console.log("Trip data from response.data:", response.data);
          return response.data;
        } else if (response) {
          console.log("Trip data from direct response:", response);
          return response;
        } else {
          console.error("No data in response");
          return null;
        }
      } catch (error) {
        console.error("AddDestinationPage - Failed to fetch trip:", error);
        throw error;
      }
    },
    enabled: !!tripId,
    retry: 2,
  });

  const addDestinationMutation = useMutation({
    mutationFn: (data) => destinationsAPI.addDestination(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations", tripId] });
      toast.success("Destination added successfully!");
      navigate(`/trip/${tripId}`);
    },
    onError: (error) => {
      console.error("Add destination error:", error);
      toast.error(error.response?.data?.message || "Failed to add destination");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!trip) {
      toast.error("Trip data not loaded yet");
      return;
    }

    // Validate dates are within trip dates
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    const arrival = new Date(formData.arrivalDate);
    const departure = new Date(formData.departureDate);

    // Reset time to midnight for accurate date comparison
    tripStart.setHours(0, 0, 0, 0);
    tripEnd.setHours(0, 0, 0, 0);
    arrival.setHours(0, 0, 0, 0);
    departure.setHours(0, 0, 0, 0);

    if (arrival < tripStart || departure > tripEnd) {
      toast.error("Destination dates must be within your trip dates");
      return;
    }

    if (departure <= arrival) {
      toast.error("Departure date must be after arrival date");
      return;
    }

    addDestinationMutation.mutate({
      ...formData,
      arrivalDate: formData.arrivalDate.toISOString().split("T")[0],
      departureDate: formData.departureDate.toISOString().split("T")[0],
    });
  };

  if (tripLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (tripError) {
    console.error("Trip error:", tripError);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Trip
          </h2>
          <p className="text-gray-600 mb-4">
            Could not load trip details. Please try again.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => refetchTrip()}
              className="btn-primary w-full"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(`/trip/${tripId}`)}
              className="btn-secondary w-full"
            >
              Back to Trip
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Trip not found
          </h2>
          <p className="text-gray-600 mb-4">
            The trip you're looking for doesn't exist or you don't have access.
          </p>
          <button
            onClick={() => navigate(`/trip/${tripId}`)}
            className="btn-primary w-full"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Add Destination to {trip?.title}
          </h1>
          <p className="text-gray-600 mb-6">
            Trip dates: {new Date(trip?.startDate).toLocaleDateString()} -{" "}
            {new Date(trip?.endDate).toLocaleDateString()}
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
                  placeholder="e.g., Kochi, Alleppey, Munnar"
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
                  placeholder="India"
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
                  placeholder="Kochi"
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
                    onChange={(date) =>
                      setFormData((prev) => ({ ...prev, arrivalDate: date }))
                    }
                    minDate={new Date(trip?.startDate)}
                    maxDate={new Date(trip?.endDate)}
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
                    onChange={(date) =>
                      setFormData((prev) => ({ ...prev, departureDate: date }))
                    }
                    minDate={formData.arrivalDate}
                    maxDate={new Date(trip?.endDate)}
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
                disabled={addDestinationMutation.isPending}
                className="flex-1 btn-primary"
              >
                {addDestinationMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  "Add Destination"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDestinationPage;