import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTrips } from '../hooks/useTrips';
import TripCard from '../components/trips/TripCard';
import TripCardSkeleton from '../components/trips/TripCardSkeleton';
import TripFilters from '../components/trips/TripFilters';
import TripStats from '../components/trips/TripStats';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const TripsPage = () => {
  const { user } = useAuth();
  const { 
    trips, 
    sharedTrips, 
    loading, 
    deleteTrip, 
    duplicateTrip,
    invitations,
    acceptInvitation,
    declineInvitation 
  } = useTrips();
  
  // Ensure trips is always an array
  const myTrips = Array.isArray(trips) ? trips : [];
  const shared = Array.isArray(sharedTrips) ? sharedTrips : [];
  const pendingInvitations = Array.isArray(invitations) ? invitations : [];

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('my-trips');
  const [showInvitations, setShowInvitations] = useState(false);

  // Get counts for tabs
  const myTripsCount = myTrips.length;
  const sharedCount = shared.length;
  const pendingCount = pendingInvitations.length;

  // Check if any filters are active
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'newest';

  // Validate dates function
  const validateDates = (startDate, endDate) => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return false;
    }
    return true;
  };

  // Filter and sort trips
  const filteredTrips = useMemo(() => {
    const tripsToFilter = activeTab === 'my-trips' ? myTrips : shared;
    
    return tripsToFilter
      .filter(trip => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch = 
            trip.title?.toLowerCase().includes(query) ||
            trip.destination?.toLowerCase().includes(query) ||
            trip.description?.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && trip.status !== statusFilter) {
          return false;
        }

        // Date filter
        if (dateFilter !== 'all' && trip.startDate) {
          const tripDate = new Date(trip.startDate);
          const now = new Date();
          
          switch (dateFilter) {
            case 'upcoming':
              if (tripDate <= now) return false;
              break;
            case 'past':
              if (tripDate >= now) return false;
              break;
            case 'this-month':
              if (tripDate.getMonth() !== now.getMonth() || 
                  tripDate.getFullYear() !== now.getFullYear()) {
                return false;
              }
              break;
            case 'next-month':
              const nextMonth = new Date(now.setMonth(now.getMonth() + 1));
              if (tripDate.getMonth() !== nextMonth.getMonth() || 
                  tripDate.getFullYear() !== nextMonth.getFullYear()) {
                return false;
              }
              break;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate);
          case 'oldest':
            return new Date(a.createdAt || a.startDate) - new Date(b.createdAt || b.startDate);
          case 'name-asc':
            return (a.title || '').localeCompare(b.title || '');
          case 'name-desc':
            return (b.title || '').localeCompare(a.title || '');
          case 'duration':
            const aDuration = a.startDate && a.endDate 
              ? new Date(a.endDate) - new Date(a.startDate) 
              : 0;
            const bDuration = b.startDate && b.endDate 
              ? new Date(b.endDate) - new Date(b.startDate) 
              : 0;
            return bDuration - aDuration;
          default:
            return 0;
        }
      });
  }, [myTrips, shared, activeTab, searchQuery, statusFilter, dateFilter, sortBy]);

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      await deleteTrip(tripId);
    }
  };

  const handleDuplicateTrip = async (tripId) => {
    await duplicateTrip(tripId);
  };

  const handleAcceptInvite = async (invitationId) => {
    await acceptInvitation(invitationId);
  };

  const handleDeclineInvite = async (invitationId) => {
    if (window.confirm('Decline this invitation?')) {
      await declineInvitation(invitationId);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <TripCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
            <p className="text-gray-600 mt-1">
              Plan, organize, and manage all your travel adventures
            </p>
          </div>
          <Link
            to="/create-trip"
            className="mt-4 md:mt-0 btn-primary inline-flex items-center group"
          >
            <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Create New Trip
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8" aria-label="Trip tabs">
            <button
              onClick={() => setActiveTab('my-trips')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'my-trips'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'my-trips' ? 'page' : undefined}
            >
              My Trips
              {myTripsCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'my-trips'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {myTripsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('shared')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'shared'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'shared' ? 'page' : undefined}
            >
              Shared with Me
              {sharedCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'shared'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {sharedCount}
                </span>
              )}
            </button>
            {pendingCount > 0 && (
              <button
                onClick={() => setShowInvitations(!showInvitations)}
                className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-yellow-600 hover:text-yellow-700 relative"
              >
                Invitations
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  {pendingCount}
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Invitations Panel */}
        {showInvitations && pendingCount > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-yellow-800">Pending Invitations</h3>
              <button
                onClick={() => setShowInvitations(false)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {pendingInvitations.map((invite) => (
                <div key={invite.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{invite.trip?.title || 'Unknown Trip'}</p>
                    <p className="text-sm text-gray-500">Invited by: {invite.invitedBy?.firstName} {invite.invitedBy?.lastName}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptInvite(invite.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Section */}
        {activeTab === 'my-trips' && myTrips.length > 0 && (
          <TripStats trips={myTrips} />
        )}
        
        {activeTab === 'shared' && shared.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <p className="text-sm text-gray-600">
              You have access to <span className="font-semibold text-primary-600">{shared.length}</span> shared {shared.length === 1 ? 'trip' : 'trips'}
            </p>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search trips by name, destination, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary inline-flex items-center justify-center sm:w-auto ${
                showFilters ? 'bg-primary-50 border-primary-300' : ''
              }`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <TripFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                dateFilter={dateFilter}
                onDateChange={setDateFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
              />
              
              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Search: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-2 hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Status: {statusFilter}
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="ml-2 hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {dateFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Date: {dateFilter}
                      <button
                        onClick={() => setDateFilter('all')}
                        className="ml-2 hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {sortBy !== 'newest' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Sort: {sortBy}
                      <button
                        onClick={() => setSortBy('newest')}
                        className="ml-2 hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredTrips.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Showing {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'}
          </p>
        )}

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="mb-4">
              <img
                src="https://illustrations.popsy.co/white/travel-planning.svg"
                alt="No trips"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'my-trips' 
                ? searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'No trips match your filters'
                  : 'No trips yet'
                : 'No trips shared with you'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeTab === 'my-trips'
                ? searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more trips'
                  : 'Start planning your first adventure today'
                : 'When someone shares a trip with you, it will appear here'}
            </p>
            {activeTab === 'my-trips' && !searchQuery && statusFilter === 'all' && dateFilter === 'all' && (
              <Link to="/create-trip" className="btn-primary inline-flex items-center">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Trip
              </Link>
            )}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={handleDeleteTrip}
                onDuplicate={handleDuplicateTrip}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsPage;