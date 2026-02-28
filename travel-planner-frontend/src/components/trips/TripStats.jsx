import React, { useState } from "react";
import {
  MapIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const TripStats = ({ trips }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!trips || trips.length === 0) return null;

  const now = new Date();

  // Calculate detailed stats
  const stats = {
    total: trips.length,
    planning: trips.filter((t) => t.status === "PLANNING").length,
    upcoming: trips.filter((t) => {
      const startDate = new Date(t.startDate);
      return (
        t.status === "UPCOMING" || (startDate > now && t.status !== "COMPLETED")
      );
    }).length,
    ongoing: trips.filter((t) => {
      const startDate = new Date(t.startDate);
      const endDate = new Date(t.endDate);
      return startDate <= now && endDate >= now;
    }).length,
    completed: trips.filter((t) => t.status === "COMPLETED").length,
    totalDays: trips.reduce((acc, trip) => {
      if (trip.startDate && trip.endDate) {
        const days =
          Math.ceil(
            (new Date(trip.endDate) - new Date(trip.startDate)) /
              (1000 * 60 * 60 * 24),
          ) + 1;
        return acc + days;
      }
      return acc;
    }, 0),
    destinations: new Set(trips.map((t) => t.destination).filter(Boolean)).size,
    totalBudget: trips.reduce((acc, trip) => acc + (trip.budget || 0), 0),
    collaborators: trips.reduce(
      (acc, trip) => acc + (trip.collaborators?.length || 0),
      0,
    ),
  };

  const statCards = [
    {
      label: "Total Trips",
      value: stats.total,
      icon: MapIcon,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      description: "All your adventures",
    },
    {
      label: "Planning",
      value: stats.planning,
      icon: ClockIcon,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      description: "In the works",
    },
    {
      label: "Upcoming",
      value: stats.upcoming,
      icon: RocketLaunchIcon,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      description: "Ready to go",
    },
    {
      label: "Ongoing",
      value: stats.ongoing,
      icon: CalendarIcon,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      description: "Currently traveling",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircleIcon,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600",
      description: "Memories made",
    },
    {
      label: "Destinations",
      value: stats.destinations,
      icon: GlobeAltIcon,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      description: "Places visited",
    },
  ];

  // Calculate percentages for progress bars
  const getPercentage = (value) => {
    return stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
  };

  return (
    <div className="mb-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const percentage = getPercentage(stat.value);

          return (
            <div
              key={index}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`${stat.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`h-5 w-5 ${stat.textColor}`} />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>

              {/* Mini Progress Bar */}
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stat.color} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Toggle Details Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 w-full py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <ChartBarIcon className="h-4 w-4 mr-2" />
        {showDetails ? "Show less" : "Show detailed insights"}
        {showDetails ? (
          <ChevronUpIcon className="h-4 w-4 ml-2" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 ml-2" />
        )}
      </button>

      {/* Detailed Insights Section */}
      {showDetails && (
        <div className="mt-4 bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 animate-slide-down">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SparklesIcon className="h-5 w-5 text-primary-500 mr-2" />
            Travel Insights
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Trip Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Trip Status Distribution
              </h4>
              <div className="space-y-3">
                {statCards.slice(1, 5).map((stat) => {
                  const percentage = getPercentage(stat.value);
                  return (
                    <div key={stat.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{stat.label}</span>
                        <span className="font-medium text-gray-900">
                          {stat.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${stat.color} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <CalendarIcon className="h-5 w-5 text-primary-500" />
                  <span className="text-xl font-bold text-gray-900">
                    {stats.totalDays}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Total Days Traveling</p>
                <p className="text-xs text-gray-400 mt-1">Across all trips</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                  <span className="text-xl font-bold text-gray-900">
                    {stats.totalBudget > 0
                      ? `$${stats.totalBudget.toLocaleString()}`
                      : "—"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-xs text-gray-400 mt-1">Planned expenses</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <UserGroupIcon className="h-5 w-5 text-purple-500" />
                  <span className="text-xl font-bold text-gray-900">
                    {stats.collaborators}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Collaborators</p>
                <p className="text-xs text-gray-400 mt-1">
                  People sharing trips
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <GlobeAltIcon className="h-5 w-5 text-indigo-500" />
                  <span className="text-xl font-bold text-gray-900">
                    {stats.destinations}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Destinations</p>
                <p className="text-xs text-gray-400 mt-1">Unique locations</p>
              </div>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              ✨ Fun Facts
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {Math.round(stats.totalDays / (stats.total || 1))}
                </div>
                <div className="text-xs text-gray-500">Avg. days per trip</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.completed > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0}
                  %
                </div>
                <div className="text-xs text-gray-500">Completion rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(stats.destinations / (stats.total || 1))}
                </div>
                <div className="text-xs text-gray-500">Destinations/trip</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.ongoing > 0 ? "🎉" : "✈️"}
                </div>
                <div className="text-xs text-gray-500">
                  {stats.ongoing > 0 ? "Currently traveling" : "Plan your next"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripStats;
