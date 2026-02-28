import React, { useState, Fragment } from 'react';
import { 
  UserGroupIcon, 
  EnvelopeIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  UserCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  PencilIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperAirplaneIcon,
  UserPlusIcon,
  BellIcon,
  BellSlashIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldCheckIconSolid } from '@heroicons/react/24/solid';
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react';
import { getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CollaboratorsList = ({ 
  collaborators = [], 
  owner, 
  onShare, 
  onRemoveCollaborator,
  onCancelInvitation,
  onUpdatePermission,
  pendingInvites = [],
  onAcceptInvite,
  onDeclineInvite,
  onResendInvite,
  currentUserEmail,
  maxDisplay = 5
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAllCollaborators, setShowAllCollaborators] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [permissionLevel, setPermissionLevel] = useState('VIEW');
  const [inviteMessage, setInviteMessage] = useState('');
  const [shareErrors, setShareErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [expandedInvite, setExpandedInvite] = useState(null);

  const handleShare = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!shareEmail) {
      setShareErrors({ email: 'Email is required' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(shareEmail)) {
      setShareErrors({ email: 'Please enter a valid email' });
      return;
    }

    // Check if user is already a collaborator
    const existingCollaborator = collaborators.find(c => c.email === shareEmail);
    if (existingCollaborator) {
      setShareErrors({ email: 'User is already a collaborator' });
      return;
    }

    // Check if invite already pending
    const existingInvite = pendingInvites.find(i => i.email === shareEmail);
    if (existingInvite) {
      setShareErrors({ email: 'Invitation already pending for this email' });
      return;
    }

    setIsSending(true);
    try {
      await onShare({ email: shareEmail, permissionLevel, message: inviteMessage });
      setShareEmail('');
      setInviteMessage('');
      setShowShareModal(false);
      toast.success(
        <div>
          <p className="font-medium">Invitation sent!</p>
          <p className="text-sm">{shareEmail} has been invited as {permissionLevel}</p>
        </div>
      );
    } catch (error) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  };

  const handleRemove = (collaboratorId, collaboratorName) => {
    if (window.confirm(`Remove ${collaboratorName} from this trip?`)) {
      onRemoveCollaborator(collaboratorId);
      toast.success(`${collaboratorName} removed from trip`);
    }
  };

  const handleCancelInvite = (invitationId, email) => {
    if (window.confirm(`Cancel invitation for ${email}?`)) {
      onCancelInvitation(invitationId);
      toast.success(`Invitation cancelled for ${email}`);
    }
  };

  const handleUpdatePermission = (collaboratorId, newPermission) => {
    if (onUpdatePermission) {
      onUpdatePermission(collaboratorId, newPermission);
      toast.success(`Permission updated to ${newPermission}`);
    }
  };

  const handleResendInvite = (invitationId, email) => {
    if (onResendInvite) {
      onResendInvite(invitationId);
      toast.success(`Invitation resent to ${email}`);
    }
  };

  // Check if current user has pending invites
  const userPendingInvites = pendingInvites?.filter(
    invite => invite.email === currentUserEmail && invite.status === 'PENDING'
  ) || [];

  // Check if user is owner
  const isOwner = owner?.email === currentUserEmail;

  // Get current user's permission
  const currentUserCollaborator = collaborators.find(c => c.email === currentUserEmail);
  const currentUserPermission = currentUserCollaborator?.permissionLevel || (isOwner ? 'OWNER' : null);

  // Permission descriptions
  const permissionDescriptions = {
    VIEW: 'Can view trip details',
    EDIT: 'Can edit trip and add activities',
    ADMIN: 'Full access, can manage collaborators'
  };

  // Permission badges
  const getPermissionBadge = (permission) => {
    switch(permission) {
      case 'ADMIN':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: ShieldCheckIconSolid };
      case 'EDIT':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: PencilIcon };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: EyeIcon };
    }
  };

  const displayedCollaborators = showAllCollaborators 
    ? collaborators 
    : collaborators.slice(0, maxDisplay);

  const hasMoreCollaborators = collaborators.length > maxDisplay;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary-100 p-2 rounded-lg mr-3">
              <UserGroupIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Collaborators</h2>
              <p className="text-sm text-gray-500">
                {collaborators.length + 1} total · {pendingInvites?.length || 0} pending
              </p>
            </div>
          </div>
          {(isOwner || currentUserPermission === 'ADMIN') && (
            <button
              onClick={() => setShowShareModal(true)}
              className="btn-primary text-sm inline-flex items-center shadow-sm hover:shadow-md transition-all"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Add People
            </button>
          )}
        </div>
      </div>

      {/* Info message if invitation feature not fully available */}
      {!pendingInvites && (
        <div className="mx-6 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Invitations are sent but will be processed in demo mode. 
              The full invitation system will be available soon.
            </p>
          </div>
        </div>
      )}

      {/* Pending Invitations for Current User */}
      {userPendingInvites.length > 0 && (
        <div className="mx-6 mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center mb-3">
            <div className="bg-yellow-100 p-1.5 rounded-full mr-2">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
            <h3 className="text-sm font-semibold text-yellow-800">
              Pending Invitations ({userPendingInvites.length})
            </h3>
          </div>
          
          {userPendingInvites.map((invite) => (
            <div key={invite.id} className="bg-white rounded-lg p-3 mb-2 last:mb-0 border border-yellow-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <EnvelopeIcon className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {invite.tripTitle || 'Trip'} invitation
                    </p>
                    <p className="text-xs text-gray-500">
                      From: {invite.inviterName || 'someone'} 
                      <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                        getPermissionBadge(invite.permissionLevel).color
                      }`}>
                        {invite.permissionLevel}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onAcceptInvite(invite.id)}
                    className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                    title="Accept invitation"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeclineInvite(invite.id)}
                    className="p-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                    title="Decline invitation"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Owner Section */}
      <div className="p-6 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
          <ShieldCheckIcon className="h-4 w-4 mr-1 text-primary-500" />
          Trip Owner
        </p>
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center border-2 border-primary-400">
                  {owner?.profileImage ? (
                    <img 
                      src={owner.profileImage} 
                      alt={owner.firstName} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-primary-700">
                      {getInitials(owner?.firstName, owner?.lastName)}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-900">
                  {owner?.firstName} {owner?.lastName}
                  {owner?.email === currentUserEmail && ' (You)'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{owner?.email}</p>
              </div>
            </div>
            <span className="bg-primary-200 text-primary-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-primary-300 shadow-sm">
              <ShieldCheckIconSolid className="h-3 w-3 inline mr-1" />
              Owner
            </span>
          </div>
        </div>
      </div>

      {/* Collaborators Section */}
      {collaborators.length > 0 && (
        <div className="p-6 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
            <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
            Collaborators ({collaborators.length})
          </p>
          
          <div className="space-y-3">
            {displayedCollaborators.map((collaborator) => {
              const permissionBadge = getPermissionBadge(collaborator.permissionLevel);
              const PermissionIcon = permissionBadge.icon;
              
              return (
                <div 
                  key={collaborator.id} 
                  className="group flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-md transition-all border border-gray-100 hover:border-gray-200"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {collaborator.profileImage ? (
                          <img 
                            src={collaborator.profileImage} 
                            alt={collaborator.firstName} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-700">
                            {getInitials(collaborator.firstName, collaborator.lastName)}
                          </span>
                        )}
                      </div>
                      {collaborator.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {collaborator.firstName} {collaborator.lastName}
                        {collaborator.email === currentUserEmail && (
                          <span className="ml-2 text-xs text-gray-500">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{collaborator.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-2">
                    {/* Permission Badge with Dropdown for Owners/Admins */}
                    {(isOwner || currentUserPermission === 'ADMIN') && collaborator.email !== currentUserEmail ? (
                      <Menu as="div" className="relative">
                        <MenuButton className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${permissionBadge.color} hover:shadow-sm`}>
                          <PermissionIcon className="h-3.5 w-3.5 mr-1" />
                          {collaborator.permissionLevel}
                          <ChevronDownIcon className="h-3.5 w-3.5 ml-1" />
                        </MenuButton>
                        
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <MenuItems className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  onClick={() => handleUpdatePermission(collaborator.id, 'VIEW')}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center ${
                                    focus ? 'bg-gray-50' : ''
                                  }`}
                                >
                                  <EyeIcon className="h-3.5 w-3.5 mr-2 text-gray-500" />
                                  View
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  onClick={() => handleUpdatePermission(collaborator.id, 'EDIT')}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center ${
                                    focus ? 'bg-gray-50' : ''
                                  }`}
                                >
                                  <PencilIcon className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                  Edit
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ focus }) => (
                                <button
                                  onClick={() => handleUpdatePermission(collaborator.id, 'ADMIN')}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center ${
                                    focus ? 'bg-gray-50' : ''
                                  }`}
                                >
                                  <ShieldCheckIcon className="h-3.5 w-3.5 mr-2 text-purple-500" />
                                  Admin
                                </button>
                              )}
                            </MenuItem>
                          </MenuItems>
                        </Transition>
                      </Menu>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border ${permissionBadge.color}`}>
                        <PermissionIcon className="h-3.5 w-3.5 mr-1" />
                        {collaborator.permissionLevel}
                      </span>
                    )}

                    {/* Remove Button (Owner/Admin only) */}
                    {(isOwner || currentUserPermission === 'ADMIN') && collaborator.email !== currentUserEmail && (
                      <button
                        onClick={() => handleRemove(
                          collaborator.id, 
                          `${collaborator.firstName} ${collaborator.lastName}`
                        )}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove collaborator"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More/Less Button */}
          {hasMoreCollaborators && (
            <button
              onClick={() => setShowAllCollaborators(!showAllCollaborators)}
              className="mt-4 w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showAllCollaborators ? (
                <>
                  Show less
                  <ChevronUpIcon className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Show {collaborators.length - maxDisplay} more
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Pending Invitations (for owner/admin view) */}
      {pendingInvites?.length > 0 && (isOwner || currentUserPermission === 'ADMIN') && (
        <div className="p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
            <ClockIcon className="h-4 w-4 mr-1 text-yellow-500" />
            Pending Invitations ({pendingInvites.length})
          </p>
          
          <div className="space-y-3">
            {pendingInvites.map((invite) => {
              const isExpanded = expandedInvite === invite.id;
              const permissionBadge = getPermissionBadge(invite.permissionLevel);
              
              return (
                <div 
                  key={invite.id} 
                  className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-yellow-300">
                        <EnvelopeIcon className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {invite.email}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center mt-0.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${permissionBadge.color}`}>
                            <PermissionBadge.icon className="h-3 w-3 mr-1" />
                            {invite.permissionLevel}
                          </span>
                          <span className="ml-2">
                            • Sent {invite.sentAt ? new Date(invite.sentAt).toLocaleDateString() : 'Recently'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setExpandedInvite(isExpanded ? null : invite.id)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-full transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleResendInvite(invite.id, invite.email)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Resend invitation"
                      >
                        <PaperAirplaneIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCancelInvite(invite.id, invite.email)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Cancel invitation"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-yellow-200 text-sm">
                      <p className="text-gray-600">
                        {invite.message || 'No personal message included.'}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Expires in {invite.expiresIn || '7 days'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white rounded-t-2xl">
              <div className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-lg mr-3">
                  <UserPlusIcon className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Invite People</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleShare} className="p-6">
              <div className="mb-4">
                <label className="input-label">Email address</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => {
                      setShareEmail(e.target.value);
                      setShareErrors({});
                    }}
                    placeholder="collaborator@example.com"
                    className={`input-field pl-10 ${shareErrors.email ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {shareErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{shareErrors.email}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="input-label">Permission level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['VIEW', 'EDIT', 'ADMIN'].map((level) => {
                    const isSelected = permissionLevel === level;
                    const badge = getPermissionBadge(level);
                    
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setPermissionLevel(level)}
                        className={`p-3 border rounded-lg text-center transition-all ${
                          isSelected 
                            ? `border-2 ${badge.color} bg-opacity-20` 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <badge.icon className={`h-5 w-5 mx-auto mb-1 ${
                          isSelected ? 'text-gray-700' : 'text-gray-500'
                        }`} />
                        <span className={`text-xs font-medium ${
                          isSelected ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {level}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {permissionDescriptions[permissionLevel]}
                </p>
              </div>

              <div className="mb-4">
                <label className="input-label">Personal message (optional)</label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add a personal note..."
                  rows="3"
                  className="input-field resize-none"
                />
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>An invitation email will be sent</li>
                      <li>They'll need to accept to join</li>
                      <li>You can cancel anytime</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="btn-secondary"
                  disabled={isSending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center min-w-[120px] justify-center"
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Invitation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default CollaboratorsList;