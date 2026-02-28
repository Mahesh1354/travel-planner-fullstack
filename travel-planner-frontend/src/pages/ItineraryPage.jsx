import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { destinationsAPI } from "../api/destinations";
import { activitiesAPI } from "../api/activities";
import tripsAPI from "../api/trips";
import DayNavigation from "../components/itinerary/DayNavigation";
import DayPlanner from "../components/itinerary/DayPlanner";
import ActivityForm from "../components/itinerary/ActivityForm";
import LoadingSpinner from "../components/common/LoadingSpinner";
import OfflineIndicator from "../components/common/OfflineIndicator";
import WeatherWidget from "../components/weather/WeatherWidget";
import { useWeather } from "../hooks/useWeather";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  CloudIcon,
  SunIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ChartBarIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { generateDays, formatDate } from "../utils/helpers";
import toast from "react-hot-toast";
import { useOffline } from "../hooks/useOffline";
import { useOfflineAction } from "../utils/offlineUtils";

// Weather icon mapping function
const getWeatherIcon = (condition) => {
  const iconMap = {
    clear: <SunIcon className="h-5 w-5 text-yellow-500" />,
    cloud: <CloudIcon className="h-5 w-5 text-gray-500" />,
    rain: <CloudIcon className="h-5 w-5 text-blue-500" />,
    snow: <CloudIcon className="h-5 w-5 text-cyan-500" />,
    thunderstorm: <CloudIcon className="h-5 w-5 text-purple-500" />,
    mist: <CloudIcon className="h-5 w-5 text-gray-400" />,
    fog: <CloudIcon className="h-5 w-5 text-gray-400" />,
  };

  const lowerCondition = condition?.toLowerCase() || "";
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerCondition.includes(key)) return icon;
  }
  return <SunIcon className="h-5 w-5 text-yellow-500" />;
};

const ItineraryPage = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentDay, setCurrentDay] = useState(1);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCompleted, setShowCompleted] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("daily");
  const [showStats, setShowStats] = useState(false);
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(true);
  const [refreshingWeather, setRefreshingWeather] = useState(false);

  // Local state to track completion status (since backend doesn't have completed field)
  const [completedActivities, setCompletedActivities] = useState(() => {
    const saved = localStorage.getItem(`completed_activities_${tripId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const { isOnline } = useOffline();
  const { executeAction } = useOfflineAction();

  // Save to localStorage whenever completedActivities changes
  useEffect(() => {
    localStorage.setItem(
      `completed_activities_${tripId}`,
      JSON.stringify(completedActivities),
    );
  }, [completedActivities, tripId]);

  // Fetch trip details
  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
    refetch: refetchTrip,
  } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      try {
        const response = await tripsAPI.getTrip(tripId);
        console.log("tripsAPI.getTrip response:", response);
        return response;
      } catch (error) {
        console.error("Failed to fetch trip:", error);
        return null;
      }
    },
    enabled: !!tripId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch destinations for this trip
  const {
    data: destinations,
    isLoading: destinationsLoading,
    refetch: refetchDestinations,
  } = useQuery({
    queryKey: ["destinations", tripId, refreshKey],
    queryFn: async () => {
      try {
        const response = await destinationsAPI.getDestinations(tripId);
        return { data: response.data || [] };
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
        return { data: [] };
      }
    },
    enabled: !!tripId,
    staleTime: 5 * 60 * 1000,
  });

  // Extract trip data - handle both formats (direct or wrapped)
  const tripData = trip?.data || trip;

  // Get the main destination for weather
  const mainDestination = useMemo(() => {
    if (destinations?.data && destinations.data.length > 0) {
      const firstDest = destinations.data[0];
      return firstDest.city || firstDest.name;
    }
    return tripData?.destination?.split(",")[0] || null;
  }, [destinations, tripData]);

  // Fetch real weather data using the useWeather hook
  const {
    currentWeather,
    forecast,
    loading: weatherLoading,
    error: weatherError,
    refreshWeather,
    lastUpdated,
    mappedCity,
  } = useWeather(mainDestination, {
    enabled: !!mainDestination,
    autoRefresh: true,
    refreshInterval: 30 * 60 * 1000, // Refresh every 30 minutes
    onSuccess: (data) => {
      console.log("Weather updated successfully:", data);
    },
    onError: (error) => {
      console.error("Weather fetch failed:", error);
    },
  });

  // Generate days array from trip dates
  const days = useMemo(() => {
    if (tripData?.startDate && tripData?.endDate) {
      return generateDays(tripData.startDate, tripData.endDate);
    }
    return [];
  }, [tripData]);

  // Get all activities grouped by day with completion status from local state
  const activitiesByDay = useMemo(() => {
    console.log("Rebuilding activities with refreshKey:", refreshKey);
    const grouped = {};
    destinations?.data?.forEach((destination) => {
      destination.activities?.forEach((activity) => {
        const day = activity.day || 1;
        if (!grouped[day]) {
          grouped[day] = [];
        }
        grouped[day].push({
          ...activity,
          completed: completedActivities[activity.id] || false,
          destinationName: destination.name,
          destinationId: destination.id,
          destinationCity: destination.city,
        });
      });
    });
    return grouped;
  }, [destinations, refreshKey, completedActivities]);

  // Calculate statistics
  const statistics = useMemo(() => {
    let totalActivities = 0;
    let completedCount = 0;
    let activitiesByType = {};

    Object.values(activitiesByDay).forEach((dayActivities) => {
      totalActivities += dayActivities.length;
      dayActivities.forEach((activity) => {
        if (activity.completed) completedCount++;

        const type = activity.type || "OTHER";
        activitiesByType[type] = (activitiesByType[type] || 0) + 1;
      });
    });

    const progress =
      totalActivities > 0 ? (completedCount / totalActivities) * 100 : 0;

    return {
      totalActivities,
      completedCount,
      progress,
      remainingCount: totalActivities - completedCount,
      activitiesByType,
      daysWithActivities: Object.keys(activitiesByDay).length,
    };
  }, [activitiesByDay]);

  // Get filtered activities for current day
  const getFilteredActivities = useCallback(() => {
    const dayActivities = activitiesByDay[currentDay] || [];

    if (filterType === "all") return dayActivities;
    if (filterType === "completed")
      return dayActivities.filter((a) => a.completed);
    if (filterType === "pending")
      return dayActivities.filter((a) => !a.completed);
    if (filterType === "sightseeing")
      return dayActivities.filter((a) => a.type === "SIGHTSEEING");
    if (filterType === "food")
      return dayActivities.filter((a) => a.type === "FOOD");
    if (filterType === "adventure")
      return dayActivities.filter((a) => a.type === "ADVENTURE");

    return dayActivities;
  }, [activitiesByDay, currentDay, filterType]);

  // Get weather for a specific day (combine real forecast with day-specific data)
  const getWeatherForDay = useCallback(
    (day) => {
      if (!forecast || forecast.length === 0) {
        // Fallback to mock data if no forecast available
        const mockWeather = [
          {
            icon: "☀️",
            temp: 25,
            condition: "Sunny",
            humidity: 50,
            windSpeed: 10,
            feelsLike: 26,
          },
          {
            icon: "⛅",
            temp: 22,
            condition: "Partly Cloudy",
            humidity: 60,
            windSpeed: 12,
            feelsLike: 23,
          },
          {
            icon: "☁️",
            temp: 20,
            condition: "Cloudy",
            humidity: 70,
            windSpeed: 15,
            feelsLike: 19,
          },
          {
            icon: "🌧️",
            temp: 18,
            condition: "Rainy",
            humidity: 85,
            windSpeed: 20,
            feelsLike: 17,
          },
        ];
        return mockWeather[(day - 1) % mockWeather.length];
      }

      // Use real forecast data if available
      const forecastIndex = (day - 1) % forecast.length;
      const dayForecast = forecast[forecastIndex];

      if (dayForecast) {
        return {
          icon: dayForecast.icon,
          temp: dayForecast.temperature,
          condition: dayForecast.description,
          humidity: dayForecast.humidity,
          windSpeed: dayForecast.windSpeed,
          feelsLike: dayForecast.feelsLike,
          iconUrl: dayForecast.iconUrl,
        };
      }

      return null;
    },
    [forecast],
  );

  // Handle weather refresh
  const handleRefreshWeather = async () => {
    setRefreshingWeather(true);
    await refreshWeather();
    setRefreshingWeather(false);
    toast.success("Weather data refreshed");
  };

  // Add activity mutation
  const addActivityMutation = useMutation({
    mutationFn: ({ destinationId, activityData }) =>
      activitiesAPI.addActivity(destinationId, activityData),
    onSuccess: (response) => {
      const newActivityId = response.data?.id || response.id;
      if (newActivityId) {
        setCompletedActivities((prev) => ({
          ...prev,
          [newActivityId]: false,
        }));
      }

      setRefreshKey((prev) => prev + 1);
      toast.success(
        <div className="flex items-center">
          <span className="text-green-500 mr-2">✓</span>
          Activity added successfully
        </div>,
      );
      setShowActivityForm(false);
      setEditingActivity(null);
    },
    onError: (error) => {
      console.error("Add activity error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to add activity");
    },
  });

  // Update activity mutation
  const updateActivityMutation = useMutation({
    mutationFn: ({ activityId, activityData }) =>
      activitiesAPI.updateActivity(activityId, activityData),
    onSuccess: (response, variables) => {
      if (variables.activityData.completed !== undefined) {
        setCompletedActivities((prev) => ({
          ...prev,
          [variables.activityId]: variables.activityData.completed,
        }));
      }

      setRefreshKey((prev) => prev + 1);
      toast.success("Activity updated successfully");
    },
    onError: (error, variables) => {
      console.error("Update failed:", {
        status: error.response?.status,
        data: error.response?.data,
        activityId: variables.activityId,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update activity";
      toast.error(errorMessage);
    },
  });

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: (activityId) => activitiesAPI.deleteActivity(activityId),
    onSuccess: (response, activityId) => {
      setCompletedActivities((prev) => {
        const newState = { ...prev };
        delete newState[activityId];
        return newState;
      });

      setRefreshKey((prev) => prev + 1);
      toast.success("Activity deleted successfully");
    },
    onError: (error) => {
      console.error("Delete activity error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to delete activity");
    },
  });

  const handleAddActivity = (day) => {
    if (!isOnline) {
      toast.success(
        <div className="flex items-center">
          <span className="text-yellow-500 mr-2">📱</span>
          Activity will be saved offline and synced when you're back online
        </div>,
        { duration: 4000 },
      );
    }
    setSelectedDay(day);
    setEditingActivity(null);
    setShowActivityForm(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setSelectedDay(activity.day);
    setShowActivityForm(true);
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      deleteActivityMutation.mutate(activityId);
    }
  };

  const handleToggleComplete = async (activityId, completed) => {
    const activity = activitiesByDay[currentDay]?.find(
      (a) => a.id === activityId,
    );

    if (!activity) {
      toast.error("Activity not found");
      return;
    }

    setCompletedActivities((prev) => ({
      ...prev,
      [activityId]: completed,
    }));

    try {
      await updateActivityMutation.mutateAsync({
        activityId,
        activityData: {
          ...activity,
          completed,
        },
      });
    } catch (error) {
      setCompletedActivities((prev) => ({
        ...prev,
        [activityId]: !completed,
      }));
      console.error("Toggle failed:", error);
    }
  };

  const handleSaveActivity = async (activityData) => {
    if (editingActivity) {
      updateActivityMutation.mutate({
        activityId: editingActivity.id,
        activityData,
      });
    } else {
      let destination = destinations?.data?.find((d) => d.day === selectedDay);
      if (!destination && destinations?.data?.length > 0) {
        destination = destinations.data[0];
      }

      if (!destination) {
        toast.error("Please add a destination first");
        return;
      }

      addActivityMutation.mutate({
        destinationId: destination.id,
        activityData: {
          ...activityData,
          day: selectedDay,
        },
      });
    }
  };

  const handleDuplicateActivity = (activity) => {
    const newActivity = {
      ...activity,
      id: undefined,
      name: `${activity.name} (Copy)`,
    };
    handleAddActivity(activity.day);
    setTimeout(() => {
      setEditingActivity(newActivity);
    }, 100);
  };

  const handleExportItinerary = () => {
    let itineraryText = `# ${tripData?.title || "Trip"} Itinerary\n\n`;

    days.forEach((day) => {
      itineraryText += `## Day ${day.day} - ${formatDate(day.date)}\n`;
      const dayActivities = activitiesByDay[day.day] || [];
      const dayWeather = getWeatherForDay(day.day);

      if (dayWeather) {
        itineraryText += `Weather: ${dayWeather.condition}, ${dayWeather.temp}°C (feels like ${dayWeather.feelsLike}°C)\n`;
      }

      if (dayActivities.length === 0) {
        itineraryText += "No activities planned\n\n";
      } else {
        dayActivities.forEach((activity) => {
          const time = activity.startTime ? `${activity.startTime} - ` : "";
          const completed = activity.completed ? "[✓] " : "[ ] ";
          itineraryText += `${completed}${time}${activity.name}`;
          if (activity.location) itineraryText += ` at ${activity.location}`;
          itineraryText += "\n";
        });
        itineraryText += "\n";
      }
    });

    const blob = new Blob([itineraryText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tripData?.title || "trip"}_itinerary.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Itinerary exported successfully");
  };

  if (tripLoading || destinationsLoading) {
    return <LoadingSpinner fullScreen text="Loading itinerary..." />;
  }

  if (tripError || (!trip?.data && !trip)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <InformationCircleIcon className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Trip not found
          </h2>
          <p className="text-gray-600 mb-6">
            The itinerary you're looking for doesn't exist or you don't have
            access.
          </p>
          <button
            onClick={() => navigate("/trips")}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg"
          >
            Back to My Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container-custom max-w-6xl">
        {/* Offline Indicator */}
        {showOfflineIndicator && <OfflineIndicator />}

        {/* Header with Stats */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <button
              onClick={() => navigate(`/trip/${tripId}`)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group w-fit"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Trip Details</span>
            </button>

            <div className="flex items-center space-x-3">
              {/* Weather Widget */}
              {mainDestination && (
                <div className="flex items-center space-x-2">
                  <WeatherWidget
                    destination={mainDestination}
                    compact
                    onRefresh={handleRefreshWeather}
                  />
                  {lastUpdated && (
                    <span className="text-xs text-gray-400">
                      Updated: {new Date(lastUpdated).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowStats(!showStats)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center text-sm font-medium text-gray-700"
              >
                <ChartBarIcon className="h-4 w-4 mr-2 text-primary-500" />
                {showStats ? "Hide Stats" : "Show Stats"}
              </button>

              <button
                onClick={handleExportItinerary}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center text-sm font-medium text-gray-700"
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                Export
              </button>

              <button
                onClick={handleRefreshWeather}
                disabled={refreshingWeather}
                className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Refresh weather"
              >
                <ArrowPathIcon
                  className={`h-5 w-5 text-gray-600 ${refreshingWeather ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <CalendarIcon className="h-8 w-8 text-primary-600 mr-3" />
                  {trip?.data?.title || trip?.title} Itinerary
                </h1>
                <p className="text-gray-600 mt-2 flex items-center">
                  <MapIcon className="h-4 w-4 mr-2" />
                  {days.length} days • {statistics.totalActivities} activities
                  planned
                  {mappedCity && mappedCity !== mainDestination && (
                    <span className="ml-2 text-xs text-primary-600">
                      (Weather for {mappedCity})
                    </span>
                  )}
                </p>
              </div>

              {/* Progress Circle */}
              {statistics.totalActivities > 0 && (
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 36}
                      strokeDashoffset={
                        2 * Math.PI * 36 * (1 - statistics.progress / 100)
                      }
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {Math.round(statistics.progress)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Current Weather Display */}
            {currentWeather && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {currentWeather.iconUrl ? (
                      <img
                        src={currentWeather.iconUrl}
                        alt={currentWeather.description}
                        className="w-12 h-12"
                      />
                    ) : (
                      getWeatherIcon(currentWeather.description)
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Current Weather</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {currentWeather.temperature}°C,{" "}
                        {currentWeather.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Humidity</p>
                      <p className="text-sm font-medium">
                        {currentWeather.humidity}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Wind</p>
                      <p className="text-sm font-medium">
                        {currentWeather.windSpeed} m/s
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Feels like</p>
                      <p className="text-sm font-medium">
                        {currentWeather.feelsLike}°C
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-200 animate-slide-down">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Trip Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600 mb-1">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.totalActivities}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.completedCount}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-sm text-yellow-600 mb-1">Remaining</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.remainingCount}
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600 mb-1">
                  Days with Activities
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.daysWithActivities}
                </p>
              </div>
            </div>

            {/* Weather Stats */}
            {forecast && forecast.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Weather Forecast
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {forecast.slice(0, 5).map((day, index) => (
                    <div
                      key={index}
                      className="text-center p-2 bg-gray-50 rounded-lg"
                    >
                      <p className="text-xs text-gray-500 mb-1">{day.day}</p>
                      {day.iconUrl ? (
                        <img
                          src={day.iconUrl}
                          alt={day.description}
                          className="w-8 h-8 mx-auto"
                        />
                      ) : (
                        getWeatherIcon(day.description)
                      )}
                      <p className="text-sm font-medium mt-1">
                        {day.temperature}°C
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Day Navigation */}
        {days.length > 0 && (
          <DayNavigation
            days={days}
            currentDay={currentDay}
            onDayChange={setCurrentDay}
            activityCounts={Object.keys(activitiesByDay).reduce((acc, day) => {
              acc[day] = activitiesByDay[day].length;
              return acc;
            }, {})}
          />
        )}

        {/* Filters and View Controls */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="all">All Activities</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="sightseeing">Sightseeing</option>
              <option value="food">Food & Dining</option>
              <option value="adventure">Adventure</option>
            </select>
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() =>
              setViewMode(viewMode === "daily" ? "weekly" : "daily")
            }
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center"
          >
            {viewMode === "daily" ? "📅 Daily View" : "📆 Weekly View"}
          </button>

          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-4 py-2 border rounded-xl transition-colors text-sm flex items-center ${
              showCompleted
                ? "bg-primary-50 border-primary-200 text-primary-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {showCompleted ? (
              <>
                <EyeIcon className="h-4 w-4 mr-2" />
                Showing Completed
              </>
            ) : (
              <>
                <EyeSlashIcon className="h-4 w-4 mr-2" />
                Hiding Completed
              </>
            )}
          </button>
        </div>

        {/* Current Day Planner */}
        {days.length > 0 && (
          <DayPlanner
            key={`day-${currentDay}-${refreshKey}-${filterType}`}
            day={currentDay}
            date={days.find((d) => d.day === currentDay)?.date}
            activities={getFilteredActivities()}
            onAddActivity={handleAddActivity}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onToggleComplete={handleToggleComplete}
            onDuplicate={handleDuplicateActivity}
            weather={getWeatherForDay(currentDay)}
            showCompleted={showCompleted}
          />
        )}

        {/* Weekly Overview */}
        {viewMode === "weekly" && days.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200 animate-slide-down">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Overview
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const dayActivities = activitiesByDay[day.day] || [];
                const completedCount = dayActivities.filter(
                  (a) => a.completed,
                ).length;
                const progress =
                  dayActivities.length > 0
                    ? (completedCount / dayActivities.length) * 100
                    : 0;
                const dayWeather = getWeatherForDay(day.day);

                return (
                  <button
                    key={day.day}
                    onClick={() => setCurrentDay(day.day)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      day.day === currentDay
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      Day {day.day}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(day.date, "MMM d")}
                    </p>

                    {/* Weather Icon */}
                    {dayWeather && (
                      <div className="mt-2 flex items-center justify-center">
                        {dayWeather.iconUrl ? (
                          <img
                            src={dayWeather.iconUrl}
                            alt={dayWeather.condition}
                            className="w-6 h-6"
                          />
                        ) : (
                          getWeatherIcon(dayWeather.condition)
                        )}
                      </div>
                    )}

                    {dayActivities.length > 0 && (
                      <>
                        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {completedCount}/{dayActivities.length}
                        </p>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity Form Modal */}
        <ActivityForm
          isOpen={showActivityForm}
          onClose={() => {
            setShowActivityForm(false);
            setEditingActivity(null);
            setSelectedDay(null);
          }}
          onSave={handleSaveActivity}
          initialData={editingActivity}
          day={selectedDay}
          date={days.find((d) => d.day === selectedDay)?.date || new Date()}
        />
      </div>
    </div>
  );
};

export default ItineraryPage;
