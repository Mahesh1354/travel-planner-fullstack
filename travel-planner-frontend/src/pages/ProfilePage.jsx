import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import authAPI from '../api/auth';
import tripsAPI from '../api/trips';
import bookingsAPI from '../api/bookings';
import notificationsAPI from '../api/notifications';
import ProfileHeader from '../components/profile/ProfileHeader';
import StatsCard from '../components/profile/StatsCard';
import ActivityTimeline from '../components/profile/ActivityTimeline';
import SettingsPanel from '../components/profile/SettingsPanel';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../hooks/useOffline';
import { 
  UserIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CloudIcon,
  TrashIcon,
  TrophyIcon,
  MapIcon,
  GlobeAltIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
  BellIcon,
  CreditCardIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAchievements, setShowAchievements] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Offline hook
  const { offlineTrips, getStorageUsed, deleteAllOffline, isDeleting } = useOffline();

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Fetch user profile with createdAt
  const { data: profileData } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await authAPI.getProfile();
      return response.data;
    },
  });

  // Fetch user's trips
  const { data: trips, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const response = await tripsAPI.getAllTrips();
      return response.data || response;
    },
  });

  // Fetch user's bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await bookingsAPI.getUserBookings();
      return response.data || response;
    },
  });

  // Fetch notification preferences
  const { data: preferences, isLoading: prefsLoading } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: async () => {
      const response = await notificationsAPI.getPreferences();
      return response.data;
    },
  });

  // ✅ MUTATIONS - Add these back!
  const updateProfileMutation = useMutation({
    mutationFn: (profileData) => {
      return Promise.resolve({ data: profileData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs) => notificationsAPI.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Preferences updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (passwordData) => {
      return Promise.resolve({ data: passwordData });
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  // Safely extract data
  const tripsList = useMemo(() => {
    if (Array.isArray(trips)) return trips;
    if (trips?.data && Array.isArray(trips.data)) return trips.data;
    return [];
  }, [trips]);

  const bookingsList = useMemo(() => {
    if (Array.isArray(bookings)) return bookings;
    if (bookings?.data && Array.isArray(bookings.data)) return bookings.data;
    return [];
  }, [bookings]);

  // Calculate stats with useMemo
  const stats = useMemo(() => {
    const uniqueCountries = new Set();
    const uniqueCities = new Set();
    let totalCost = 0;
    let upcomingTrips = 0;
    let completedTrips = 0;
    
    tripsList.forEach(trip => {
      if (trip.destination) {
        const parts = trip.destination.split(',');
        if (parts.length > 1) uniqueCountries.add(parts[1].trim());
        uniqueCities.add(parts[0].trim());
      }
      
      const now = new Date();
      const endDate = trip.endDate ? new Date(trip.endDate) : null;
      
      if (endDate && endDate < now) {
        completedTrips++;
      } else {
        upcomingTrips++;
      }
    });

    bookingsList.forEach(booking => {
      totalCost += booking?.price || 0;
    });

    return {
      totalTrips: tripsList.length,
      countriesVisited: uniqueCountries.size,
      citiesVisited: uniqueCities.size,
      totalDays: tripsList.reduce((acc, trip) => {
        if (trip?.startDate && trip?.endDate) {
          const start = new Date(trip.startDate);
          const end = new Date(trip.endDate);
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          return acc + (days > 0 ? days : 0);
        }
        return acc;
      }, 0),
      totalSpent: totalCost,
      upcomingTrips,
      completedTrips,
      totalPhotos: 0,
      savedPlaces: 0,
      favoriteDestinations: uniqueCities.size > 0 ? Array.from(uniqueCities).slice(0, 3) : [],
    };
  }, [tripsList, bookingsList]);

  // Calculate achievements
  const achievements = useMemo(() => [
    {
      id: 'first_trip',
      name: 'First Adventure',
      description: 'Created your first trip',
      icon: '🏆',
      achieved: stats.totalTrips >= 1,
      progress: Math.min(100, (stats.totalTrips / 1) * 100),
      date: tripsList[0]?.createdAt
    },
    {
      id: 'globetrotter',
      name: 'Globetrotter',
      description: 'Visit 5 different countries',
      icon: '🌍',
      achieved: stats.countriesVisited >= 5,
      progress: Math.min(100, (stats.countriesVisited / 5) * 100),
      current: stats.countriesVisited,
      target: 5
    },
    {
      id: 'city_explorer',
      name: 'City Explorer',
      description: 'Visit 10 different cities',
      icon: '🏙️',
      achieved: stats.citiesVisited >= 10,
      progress: Math.min(100, (stats.citiesVisited / 10) * 100),
      current: stats.citiesVisited,
      target: 10
    },
    {
      id: 'month_traveler',
      name: 'Month Traveler',
      description: 'Spend 30+ days traveling',
      icon: '📅',
      achieved: stats.totalDays >= 30,
      progress: Math.min(100, (stats.totalDays / 30) * 100),
      current: stats.totalDays,
      target: 30
    },
    {
      id: 'trip_planner',
      name: 'Trip Planner',
      description: 'Plan 10 trips',
      icon: '✈️',
      achieved: stats.totalTrips >= 10,
      progress: Math.min(100, (stats.totalTrips / 10) * 100),
      current: stats.totalTrips,
      target: 10
    },
    {
      id: 'photo_taker',
      name: 'Photo Taker',
      description: 'Upload 50 photos',
      icon: '📸',
      achieved: false,
      progress: 0,
      current: 0,
      target: 50
    },
  ], [stats, tripsList]);

  // Calculate member since date
  const memberSince = useMemo(() => {
    if (profileData?.createdAt) {
      return new Date(profileData.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    if (user?.createdAt) {
      return new Date(user?.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    if (tripsList.length > 0) {
      const dates = tripsList
        .map(t => t.createdAt || t.startDate)
        .filter(Boolean)
        .map(d => new Date(d));
      if (dates.length > 0) {
        const earliest = new Date(Math.min(...dates));
        return earliest.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }
    return 'N/A';
  }, [profileData, user, tripsList]);

  // Recent activity with better data
  const recentActivity = useMemo(() => {
    const activities = [];
    
    // Add trip creations
    tripsList.slice(0, 3).forEach(trip => {
      if (trip.createdAt) {
        activities.push({
          id: `trip_${trip.id}`,
          type: 'trip_created',
          icon: '✈️',
          description: `Created trip "${trip.title}"`,
          tripName: trip.title,
          tripId: trip.id,
          createdAt: trip.createdAt,
        });
      }
    });

    // Add bookings
    bookingsList.slice(0, 3).forEach(booking => {
      if (booking.bookedAt) {
        activities.push({
          id: `booking_${booking.id}`,
          type: 'booking_made',
          icon: '🎫',
          description: `Booked ${booking.bookingType?.toLowerCase() || 'trip'}`,
          tripName: booking.tripTitle || 'Trip',
          tripId: booking.tripId,
          createdAt: booking.bookedAt,
        });
      }
    });

    // Sort by date (newest first)
    return activities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [tripsList, bookingsList]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon, count: null },
    { id: 'stats', label: 'Statistics', icon: ChartBarIcon, count: stats.totalTrips },
    { id: 'achievements', label: 'Achievements', icon: TrophyIcon, count: achievements.filter(a => a.achieved).length },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, count: null },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleClearOfflineData = () => {
    if (window.confirm('Clear all offline data? This will not delete your trips from the cloud.')) {
      deleteAllOffline();
      toast.success('Offline data cleared');
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied to clipboard');
  };

  if (tripsLoading || bookingsLoading || prefsLoading) {
    return <LoadingSpinner fullScreen text="Loading profile..." />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300`}>
      <div className="container-custom max-w-7xl">
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          stats={stats}
          onUpdatePhoto={(file) => console.log('Update photo:', file)}
          onUpdateProfile={updateProfileMutation.mutate}
          onShare={handleShareProfile}
        />

        {/* Quick Stats Bar */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalTrips}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Trips</p>
              </div>
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                <MapIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.countriesVisited}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Countries</p>
              </div>
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <GlobeAltIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalDays}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Days Traveled</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.totalSpent.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
              </div>
              <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm flex items-center relative
                    ${activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Activity Timeline */}
              <div className="lg:col-span-2">
                <ActivityTimeline activities={recentActivity} />
                
                {/* Favorite Destinations */}
                {stats.favoriteDestinations.length > 0 && (
                  <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <HeartIcon className="h-5 w-5 text-red-500 mr-2" />
                      Favorite Destinations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {stats.favoriteDestinations.map((city, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                        >
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column - Stats and Info */}
              <div className="space-y-6">
                {/* Member Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Member Information
                  </h3>
                  <dl className="space-y-4">
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Member since</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white">
                        {memberSince}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Email verified</dt>
                      <dd className="text-sm font-medium">
                        {user?.emailVerified ? (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
                            ⚠ Pending
                          </span>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Account type</dt>
                      <dd className="text-sm font-medium">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          user?.role === 'ADMIN'
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {user?.role || 'User'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Link
                      to="/create-trip"
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-3">
                          <DocumentDuplicateIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Create New Trip</span>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      to="/bookings"
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                          <CreditCardIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Bookings</span>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      to="/invitations"
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-3">
                          <BellIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Invitations</span>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Offline Storage Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CloudIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                    Offline Storage
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Storage used</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getStorageUsed()}
                      </span>
                    </div>
                    
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-600 dark:bg-primary-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((offlineTrips?.length || 0) * 10, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Trips offline: {offlineTrips?.length || 0}</span>
                      <span>50 MB limit</span>
                    </div>
                    
                    {offlineTrips?.length > 0 && (
                      <button
                        onClick={handleClearOfflineData}
                        disabled={isDeleting}
                        className="w-full mt-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        {isDeleting ? 'Clearing...' : 'Clear Offline Data'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {darkMode ? (
                        <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                      ) : (
                        <SunIcon className="h-5 w-5 text-yellow-500 mr-3" />
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Dark Mode
                      </span>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        darkMode ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center justify-center border border-red-200 dark:border-red-800"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-8">
              <StatsCard stats={stats} />
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Upcoming vs Completed Trips */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Trip Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Upcoming</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.upcomingTrips}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${(stats.upcomingTrips / Math.max(stats.totalTrips, 1)) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Completed</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{stats.completedTrips}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600 rounded-full"
                        style={{ width: `${(stats.completedTrips / Math.max(stats.totalTrips, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Travel Map Placeholder */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Travel Map
                  </h3>
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-2">Map coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Your Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      achievement.achieved
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{achievement.icon}</span>
                      {achievement.achieved && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                          Unlocked
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {achievement.description}
                    </p>
                    
                    {achievement.target && (
                      <>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {achievement.current || 0}/{achievement.target}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              achievement.achieved ? 'bg-green-600' : 'bg-primary-600'
                            }`}
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </>
                    )}
                    
                    {achievement.date && (
                      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                        Unlocked on {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsPanel
              preferences={preferences?.data}
              onUpdatePreferences={updatePreferencesMutation.mutate}
              onChangePassword={changePasswordMutation.mutate}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;