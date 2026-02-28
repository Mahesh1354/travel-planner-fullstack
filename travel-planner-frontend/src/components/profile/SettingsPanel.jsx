import React, { useState } from 'react';
import { 
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  LockClosedIcon,
  KeyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const SettingsPanel = ({ preferences, onUpdatePreferences, onChangePassword }) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailEnabled: preferences?.emailEnabled || true,
    pushEnabled: preferences?.pushEnabled || true,
    smsEnabled: preferences?.smsEnabled || false,
    flightUpdates: preferences?.flightUpdates || true,
    weatherAlerts: preferences?.weatherAlerts || true,
    groupActivities: preferences?.groupActivities || true,
    bookingConfirmations: preferences?.bookingConfirmations || true,
    paymentReminders: preferences?.paymentReminders || true,
    promotional: preferences?.promotional || false,
    quietHoursStart: preferences?.quietHoursStart || '22:00',
    quietHoursEnd: preferences?.quietHoursEnd || '08:00',
  });

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'privacy', label: 'Privacy & Security', icon: LockClosedIcon },
    { id: 'language', label: 'Language & Region', icon: GlobeAltIcon },
  ];

  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotificationPrefs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    onUpdatePreferences(notificationPrefs);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onChangePassword(passwordData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Settings tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm flex items-center
                  ${activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleNotificationSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    Email Notifications
                  </span>
                  <input
                    type="checkbox"
                    name="emailEnabled"
                    checked={notificationPrefs.emailEnabled}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-2" />
                    Push Notifications
                  </span>
                  <input
                    type="checkbox"
                    name="pushEnabled"
                    checked={notificationPrefs.pushEnabled}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-2" />
                    SMS Notifications
                  </span>
                  <input
                    type="checkbox"
                    name="smsEnabled"
                    checked={notificationPrefs.smsEnabled}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Flight Updates</span>
                  <input
                    type="checkbox"
                    name="flightUpdates"
                    checked={notificationPrefs.flightUpdates}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Weather Alerts</span>
                  <input
                    type="checkbox"
                    name="weatherAlerts"
                    checked={notificationPrefs.weatherAlerts}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Group Activities</span>
                  <input
                    type="checkbox"
                    name="groupActivities"
                    checked={notificationPrefs.groupActivities}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Booking Confirmations</span>
                  <input
                    type="checkbox"
                    name="bookingConfirmations"
                    checked={notificationPrefs.bookingConfirmations}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Payment Reminders</span>
                  <input
                    type="checkbox"
                    name="paymentReminders"
                    checked={notificationPrefs.paymentReminders}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Promotional Emails</span>
                  <input
                    type="checkbox"
                    name="promotional"
                    checked={notificationPrefs.promotional}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quiet Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Start Time</label>
                  <input
                    type="time"
                    name="quietHoursStart"
                    value={notificationPrefs.quietHoursStart}
                    onChange={handleNotificationChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">End Time</label>
                  <input
                    type="time"
                    name="quietHoursEnd"
                    value={notificationPrefs.quietHoursEnd}
                    onChange={handleNotificationChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Save Notification Settings
            </button>
          </form>
        )}

        {/* Privacy & Security Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
                Change Password
              </h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="input-label">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    required
                    minLength={8}
                  />
                </div>
                
                <div>
                  <label className="input-label">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <button type="submit" className="btn-primary">
                  Update Password
                </button>
              </form>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2" />
                Two-Factor Authentication
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              
              <button className="btn-secondary">
                Enable 2FA
              </button>
            </div>
          </div>
        )}

        {/* Language & Region Tab */}
        {activeTab === 'language' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Language</h3>
              <select className="input-field max-w-md">
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Currency</h3>
              <select className="input-field max-w-md">
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Time Zone</h3>
              <select className="input-field max-w-md">
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>

            <button className="btn-primary">
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;