import React, { useState } from 'react';
import { 
  CameraIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { getInitials } from '../../utils/helpers';

const ProfileHeader = ({ user, onUpdatePhoto, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600 relative">
        <button
          onClick={() => document.getElementById('cover-upload').click()}
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
        >
          <CameraIcon className="h-5 w-5 text-gray-700" />
        </button>
        <input type="file" id="cover-upload" className="hidden" accept="image/*" />
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end -mt-12">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl font-medium text-primary-600">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => document.getElementById('avatar-upload').click()}
              className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50 transition-colors"
            >
              <CameraIcon className="h-4 w-4 text-gray-600" />
            </button>
            <input type="file" id="avatar-upload" className="hidden" accept="image/*" />
          </div>

          {/* Name and Edit Button */}
          <div className="mt-4 md:mt-0 md:ml-6 flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="input-field"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="btn-primary inline-flex items-center"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary inline-flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-gray-600 mt-1">{user?.email}</p>
                  {user?.bio && (
                    <p className="text-gray-600 mt-2 max-w-2xl">{user.bio}</p>
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary inline-flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;