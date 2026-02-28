import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import tripsAPI from "../api/trips";
import { destinationsAPI } from "../api/destinations";
import { activitiesAPI } from "../api/activities";
import { useAuth } from "../contexts/AuthContext";
import TripHeader from "../components/trips/TripHeader";
import CollaboratorsList from "../components/trips/CollaboratorsList";
import DestinationCard from "../components/itinerary/DestinationCard";
import OfflineManager from "../components/offline/OfflineManager";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { PlusIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import WeatherCard from "../components/weather/WeatherCard";
import ForecastCard from "../components/weather/ForecastCard";
import { useWeather } from "../hooks/useWeather";
import ExportModal from "../components/export/ExportModal";
import { generateDays } from "../utils/helpers";
import TripMapPage from "./TripMapPage";
import { MapPinIcon } from "@heroicons/react/24/outline";

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDestination, setShowAddDestination] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [id]);

  // Validate dates function
  const validateDates = (startDate, endDate) => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      toast.error("End date must be after start date");
      return false;
    }
    return true;
  };

  // Fetch trip details
  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
    refetch: refetchTrip,
  } = useQuery({
    queryKey: ["trip", id, key],
    queryFn: async () => {
      try {
        const response = await tripsAPI.getTrip(id);
        console.log("Raw API response:", response);

        if (response && response.id) {
          return { data: response };
        } else if (response && response.data) {
          return response;
        } else {
          console.error("Unexpected response format:", response);
          return { data: null };
        }
      } catch (error) {
        console.error("Failed to fetch trip:", error);
        return { data: null };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Fetch destinations for this trip
  const {
    data: destinations,
    isLoading: destinationsLoading,
    refetch: refetchDestinations,
  } = useQuery({
    queryKey: ["destinations", id],
    queryFn: async () => {
      try {
        const response = await destinationsAPI.getDestinations(id);
        console.log("Raw destinations response:", response);

        if (Array.isArray(response)) {
          return { data: response };
        } else if (response?.data && Array.isArray(response.data)) {
          return response;
        }
        return { data: [] };
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
        return { data: [] };
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Fetch pending invitations for this trip
  const { data: pendingInvites, refetch: refetchInvites } = useQuery({
    queryKey: ["pendingInvites", id],
    queryFn: async () => {
      try {
        const response = await tripsAPI.getPendingInvitations(id);
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch pending invites:", error);
        return [];
      }
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });

  // Fetch user's pending invitations (for current user)
  const { data: userInvitations, refetch: refetchUserInvites } = useQuery({
    queryKey: ["userInvitations"],
    queryFn: async () => {
      try {
        const response = await tripsAPI.getUserInvitations();
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch user invitations:", error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });

  // Flatten activities from all destinations for export
  const flattenedActivities = useMemo(() => {
    if (!destinations?.data) return [];

    return destinations.data.flatMap((dest) =>
      (dest.activities || []).map((activity) => ({
        ...activity,
        destinationId: dest.id,
        destinationName: dest.name,
      })),
    );
  }, [destinations]);

  // Group activities by day for export
  const activitiesByDay = useMemo(() => {
    const grouped = {};
    flattenedActivities.forEach((activity) => {
      const day = activity.day || 1;
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(activity);
    });
    return grouped;
  }, [flattenedActivities]);

  // Generate days array for export
  const days = useMemo(() => {
    if (trip?.data?.startDate && trip?.data?.endDate) {
      return generateDays(trip.data.startDate, trip.data.endDate);
    }
    return [];
  }, [trip?.data?.startDate, trip?.data?.endDate]);

  // Delete trip mutation
  const deleteTripMutation = useMutation({
    mutationFn: (tripId) => tripsAPI.deleteTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip deleted successfully");
      navigate("/trips");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete trip");
    },
  });

  // Duplicate trip mutation
  const duplicateTripMutation = useMutation({
    mutationFn: (tripId) => tripsAPI.duplicateTrip(tripId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip duplicated successfully");
      navigate(`/trip/${response.data.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to duplicate trip");
    },
  });

  // Share trip mutation
  const shareTripMutation = useMutation({
    mutationFn: ({ tripId, shareData }) =>
      tripsAPI.shareTrip(tripId, shareData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", id] });
      queryClient.invalidateQueries({ queryKey: ["pendingInvites", id] });
      toast.success("Invitation sent successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to share trip";
      toast.error(errorMessage);
    },
  });

  // Accept invitation mutation
  const acceptInviteMutation = useMutation({
    mutationFn: (invitationId) => tripsAPI.acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userInvitations"] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Invitation accepted!");
      navigate("/trips");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to accept invitation",
      );
    },
  });

  // Decline invitation mutation
  const declineInviteMutation = useMutation({
    mutationFn: (invitationId) => tripsAPI.declineInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userInvitations"] });
      toast.success("Invitation declined");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to decline invitation",
      );
    },
  });

  // Cancel invitation mutation (for owner)
  const cancelInviteMutation = useMutation({
    mutationFn: (invitationId) => tripsAPI.cancelInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingInvites", id] });
      toast.success("Invitation cancelled");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to cancel invitation",
      );
    },
  });

  // Remove collaborator mutation
  const removeCollaboratorMutation = useMutation({
    mutationFn: (collaboratorId) =>
      tripsAPI.removeCollaborator(id, collaboratorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", id] });
      toast.success("Collaborator removed");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to remove collaborator",
      );
    },
  });

  // Delete destination mutation
  const deleteDestinationMutation = useMutation({
    mutationFn: (destinationId) =>
      destinationsAPI.deleteDestination(destinationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations", id] });
      toast.success("Destination deleted successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete destination",
      );
    },
  });

  // Get the first destination city for weather
  const getWeatherCity = () => {
    if (!showWeather) return null;

    if (destinations?.data && destinations.data.length > 0) {
      const firstDest = destinations.data[0];
      const cityName = firstDest.city || firstDest.name;
      console.log("Using destination for weather:", cityName);
      return cityName;
    }

    if (trip?.data?.title?.toLowerCase().includes("paris")) {
      return "Paris";
    }
    if (trip?.data?.title?.toLowerCase().includes("new york")) {
      return "New York";
    }

    return null;
  };

  // Weather hook with caching
  const weatherCity = getWeatherCity();
  const {
    currentWeather,
    forecast,
    loading: weatherLoading,
    error: weatherError,
  } = useWeather(weatherCity, { enabled: showWeather && !!weatherCity });

  const handleDeleteTrip = (tripId) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      deleteTripMutation.mutate(tripId);
    }
  };

  const handleDuplicateTrip = (tripId) => {
    duplicateTripMutation.mutate(tripId);
  };

  const handleShareTrip = async (shareData) => {
    try {
      console.log("Sharing trip with data:", shareData);
      await shareTripMutation.mutateAsync({ tripId: id, shareData });
    } catch (error) {
      console.error("Share error details:", error.response?.data);
    }
  };

  const handleAcceptInvite = (invitationId) => {
    acceptInviteMutation.mutate(invitationId);
  };

  const handleDeclineInvite = (invitationId) => {
    if (window.confirm("Decline this invitation?")) {
      declineInviteMutation.mutate(invitationId);
    }
  };

  const handleCancelInvitation = (invitationId) => {
    cancelInviteMutation.mutate(invitationId);
  };

  const handleRemoveCollaborator = (collaboratorId) => {
    removeCollaboratorMutation.mutate(collaboratorId);
  };

  const handleDeleteDestination = (destinationId) => {
    if (window.confirm("Are you sure you want to delete this destination?")) {
      deleteDestinationMutation.mutate(destinationId);
    }
  };

  const handleEditDestination = (destination) => {
    navigate(`/trip/${id}/edit-destination/${destination.id}`);
  };

  if (tripLoading || destinationsLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (tripError || !trip?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Trip not found
          </h2>
          <p className="text-gray-600 mb-4">
            The trip you're looking for doesn't exist or you don't have access.
          </p>
          <Link to="/trips" className="btn-primary">
            Back to My Trips
          </Link>
        </div>
      </div>
    );
  }

  // Safely access trip data with fallbacks
  const tripData = trip.data;
  const collaborators = tripData.collaborators || [];
  const owner = tripData.owner || user;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Trip Header */}
        <TripHeader
          trip={tripData}
          onDelete={handleDeleteTrip}
          onDuplicate={handleDuplicateTrip}
          onShare={handleShareTrip}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Destinations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Destinations Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Destinations
                </h2>
                <Link
                  to={`/trip/${id}/add-destination`}
                  className="btn-primary inline-flex items-center text-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Destination
                </Link>
              </div>

              {!destinations?.data || destinations.data.length === 0 ? (
                <div className="text-center py-12">
                  <img
                    src="https://illustrations.popsy.co/white/travel-planning.svg"
                    alt="No destinations"
                    className="w-32 h-32 mx-auto mb-4"
                  />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No destinations added yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start planning your trip by adding destinations
                  </p>
                  <Link
                    to={`/trip/${id}/add-destination`}
                    className="btn-primary inline-flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Destination
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {destinations.data.map((destination) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      tripId={id}
                      onEdit={handleEditDestination}
                      onDelete={handleDeleteDestination}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                to={`/trip/${id}/itinerary`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  View Itinerary
                </h3>
                <p className="text-sm text-gray-600">
                  See all your activities organized by day
                </p>
              </Link>
              <Link
                to={`/trip/${id}/budget`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  Budget Overview
                </h3>
                <p className="text-sm text-gray-600">
                  Track expenses and manage your travel budget
                </p>
              </Link>
              <Link
                to={`/trip/${id}/bookings`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Bookings</h3>
                <p className="text-sm text-gray-600">
                  Search and manage flights, hotels, and activities
                </p>
              </Link>
              <Link
                to={`/trip/${id}/checklist`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  Packing Checklist
                </h3>
                <p className="text-sm text-gray-600">
                  Never forget essential items for your trip
                </p>
              </Link>
              <Link
                to={`/trip/${id}/map`}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg"
              >
                <MapPinIcon className="h-5 w-5 mr-2" />
                View Map
              </Link>
            </div>
          </div>

          {/* Right Column - Collaborators, Offline, Weather, Export & Info */}
          <div className="space-y-6">
            {/* Offline Manager */}
            <OfflineManager tripId={id} tripTitle={tripData?.title} />

            {/* Weather Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <button
                onClick={() => setShowWeather(!showWeather)}
                className="w-full btn-secondary mb-4"
              >
                {showWeather ? "Hide Weather" : "Show Weather"}
              </button>

              {showWeather && (
                <div className="space-y-4">
                  {destinations?.data && destinations.data.length > 0 ? (
                    <>
                      <p className="text-sm text-gray-500 mb-2">
                        Weather for:{" "}
                        {destinations.data[0].city || destinations.data[0].name}
                        , {destinations.data[0].country}
                      </p>
                      <WeatherCard
                        weather={currentWeather}
                        loading={weatherLoading}
                        error={weatherError}
                      />
                      {forecast && <ForecastCard forecast={forecast} />}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Add a destination to see weather forecast
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Collaborators List */}
            <CollaboratorsList
              collaborators={collaborators}
              owner={owner}
              pendingInvites={pendingInvites}
              currentUserEmail={user?.email}
              onShare={handleShareTrip}
              onRemoveCollaborator={handleRemoveCollaborator}
              onCancelInvitation={handleCancelInvitation}
              onAcceptInvite={handleAcceptInvite}
              onDeclineInvite={handleDeclineInvite}
            />

            {/* Trip Details Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Trip Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Created</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {tripData.createdAt
                      ? new Date(tripData.createdAt).toLocaleDateString()
                      : "N/A"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Last updated</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {tripData.updatedAt
                      ? new Date(tripData.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Visibility</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {tripData.isPublic ? "Public" : "Private"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Export Trip</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="w-full btn-secondary text-sm flex items-center justify-center"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Export Options
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        trip={tripData}
        destinations={destinations?.data || []}
        activities={flattenedActivities}
        activitiesByDay={activitiesByDay}
        days={days}
      />
    </div>
  );
};

export default TripDetailPage;
