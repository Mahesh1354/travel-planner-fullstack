import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import tripsAPI from "../api/trips";
import { useAuth } from "../contexts/AuthContext";
import LocationSearch from "../components/forms/LocationSearch";
// import LocationSearchFallback from '../components/forms/LocationSearchFallback'; // Uncomment if using fallback
import ImagePicker from "../components/forms/ImagePicker";
import DateRangePicker from "../components/forms/DateRangePicker";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const schema = yup.object({
  title: yup
    .string()
    .required("Trip title is required")
    .min(3, "Title must be at least 3 characters"),
  description: yup
    .string()
    .max(500, "Description must be less than 500 characters"),
  destination: yup.string().required("Destination is required"),
  isPublic: yup.boolean(),
});

const CreateTripPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 7)),
  );
  const [coverImage, setCoverImage] = useState(
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format",
  );
  const [selectedLocation, setSelectedLocation] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      destination: "",
      isPublic: false,
    },
  });

  const destination = watch("destination");

  // Fetch trip data if editing
  const { data: tripData, isLoading: tripLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      const response = await tripsAPI.getTrip(id);
      return response.data;
    },
    enabled: isEditing,
  });

  // Set form values when editing
  useEffect(() => {
    if (tripData?.data && isEditing) {
      const trip = tripData.data;
      setValue("title", trip.title);
      setValue("description", trip.description || "");
      setValue("destination", trip.destination || "");
      setValue("isPublic", trip.isPublic || false);

      if (trip.startDate) setStartDate(new Date(trip.startDate));
      if (trip.endDate) setEndDate(new Date(trip.endDate));
      if (trip.coverImage) setCoverImage(trip.coverImage);
    }
  }, [tripData, isEditing, setValue]);

  // Create trip mutation
  const createTripMutation = useMutation({
    mutationFn: (tripData) => tripsAPI.createTrip(tripData),
    onSuccess: (response) => {
      console.log("Create trip response:", response); // Debug log

      // Handle different response formats
      let tripId;
      if (response?.data?.id) {
        tripId = response.data.id;
      } else if (response?.id) {
        tripId = response.id;
      } else if (response?.data) {
        tripId = response.data;
      }

      if (tripId) {
        queryClient.invalidateQueries({ queryKey: ["trips"] });
        toast.success("Trip created successfully!");
        navigate(`/trip/${tripId}`);
      } else {
        console.error("Unexpected response format:", response);
        toast.success("Trip created but unable to redirect");
        navigate("/trips");
      }
    },
    onError: (error) => {
      console.error("Create trip error:", error);
      toast.error(error.response?.data?.message || "Failed to create trip");
    },
  });

  // Update trip mutation
  const updateTripMutation = useMutation({
    mutationFn: ({ id, data }) => tripsAPI.updateTrip(id, data),
    onSuccess: (response, variables) => {
      console.log("Update trip response:", response); // Debug log
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trip", variables.id] });
      toast.success("Trip updated successfully!");
      navigate(`/trip/${variables.id}`);
    },
    onError: (error) => {
      console.error("Update trip error:", error);
      toast.error(error.response?.data?.message || "Failed to update trip");
    },
  });

  const onSubmit = async (data) => {
    // Validate dates
    if (endDate < startDate) {
      toast.error("End date must be after start date");
      return;
    }

    // Validate destination
    if (!data.destination || data.destination.trim() === "") {
      toast.error("Please enter a destination");
      return;
    }

    try {
      const tripData = {
        title: data.title,
        description: data.description || "",
        destination: data.destination,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        coverImage,
        isPublic: data.isPublic || false,
      };

      console.log("Submitting trip:", tripData);

      if (isEditing) {
        await updateTripMutation.mutateAsync({ id, data: tripData });
      } else {
        await createTripMutation.mutateAsync(tripData);
      }
    } catch (error) {
      console.error("Failed to create trip:", error);
      toast.error(error.response?.data?.message || "Failed to create trip");
    }
  };

  if (isEditing && tripLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Trip" : "Create New Trip"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing
              ? "Update your trip details and plans"
              : "Start planning your next adventure by filling in the basic details"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Basic Information
            </h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="input-label">
                  Trip Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("title")}
                  type="text"
                  className="input-field"
                  placeholder="e.g., Summer in Europe, Bali Adventure, Tokyo Explorer"
                />
                {errors.title && (
                  <p className="error-text">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="input-label">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows="4"
                  className="input-field"
                  placeholder="Tell us about your trip, your plans, and what you're excited about..."
                />
                {errors.description && (
                  <p className="error-text">{errors.description.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 500 characters
                </p>
              </div>

              {/* Destination */}
              <div>
                <label htmlFor="destination" className="input-label">
                  Destination <span className="text-red-500">*</span>
                </label>
                <LocationSearch
                  value={destination}
                  onChange={(value) => {
                    setValue("destination", value, { shouldValidate: true });
                  }}
                  onSelect={(location) => {
                    setSelectedLocation(location);
                    console.log("Selected location:", location);
                  }}
                />
                {errors.destination && (
                  <p className="error-text">{errors.destination.message}</p>
                )}
                {!errors.destination && !destination && (
                  <p className="text-xs text-gray-400 mt-1">
                    Start typing to search for a destination
                  </p>
                )}
              </div>

              {/* Date Range */}
              <div>
                <label className="input-label">
                  Travel Dates <span className="text-red-500">*</span>
                </label>
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </div>

              {/* Privacy Setting */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    {...register("isPublic")}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Make this trip public (visible to other users)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Cover Image
            </h2>
            <ImagePicker selectedImage={coverImage} onSelect={setCoverImage} />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <span className="flex items-center">
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
                  {isEditing ? "Updating..." : "Creating..."}
                </span>
              ) : isEditing ? (
                "Update Trip"
              ) : (
                "Create Trip"
              )}
            </button>
          </div>
        </form>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            ✨ Tips for a great trip
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • Choose a descriptive title that captures the essence of your
              trip
            </li>
            <li>• Add a destination to get personalized recommendations</li>
            <li>
              • You can always add more details, destinations, and activities
              later
            </li>
            <li>
              • Make your trip public to share with friends or get inspiration
              from others
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateTripPage;
