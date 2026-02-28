import React from 'react';
import { Link } from 'react-router-dom';
import { useTrips } from '../hooks/useTrips';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const InvitationsPage = () => {
  const { 
    invitations, 
    invitationsLoading, 
    acceptInvitation, 
    declineInvitation 
  } = useTrips();

  const handleAccept = async (invitationId) => {
    try {
      await acceptInvitation(invitationId);
    } catch (error) {
      toast.error('Failed to accept invitation');
    }
  };

  const handleDecline = async (invitationId) => {
    if (window.confirm('Are you sure you want to decline this invitation?')) {
      try {
        await declineInvitation(invitationId);
      } catch (error) {
        toast.error('Failed to decline invitation');
      }
    }
  };

  if (invitationsLoading) {
    return <LoadingSpinner fullScreen text="Loading invitations..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Invitations</h1>
        <p className="text-gray-600 mb-8">
          Manage your pending trip invitations
        </p>

        {invitations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📬</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No pending invitations</h2>
            <p className="text-gray-600 mb-6">
              You don't have any trip invitations at the moment.
            </p>
            <Link to="/trips" className="btn-primary">
              Go to My Trips
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invite) => (
              <div key={invite.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">✈️</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {invite.trip?.title || 'Untitled Trip'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Invited by: {invite.invitedBy?.firstName} {invite.invitedBy?.lastName}
                        </p>
                        {invite.trip?.startDate && invite.trip?.endDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(invite.trip.startDate).toLocaleDateString()} - {new Date(invite.trip.endDate).toLocaleDateString()}
                          </p>
                        )}
                        {invite.trip?.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {invite.trip.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    <button
                      onClick={() => handleAccept(invite.id)}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(invite.id)}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Decline
                    </button>
                  </div>
                </div>

                {/* Permission Level Badge */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Permission: </span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    invite.permissionLevel === 'EDIT' 
                      ? 'bg-blue-100 text-blue-800'
                      : invite.permissionLevel === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {invite.permissionLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationsPage;