import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { 
  XMarkIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  LinkIcon,
  TagIcon,
  PhotoIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { ACTIVITY_TYPES, CURRENCIES } from '../../utils/constants';

const ActivityForm = ({ isOpen, onClose, onSave, initialData, day, date }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'SIGHTSEEING',
    startTime: '',
    endTime: '',
    location: '',
    cost: '',
    currency: 'USD',
    notes: '',
    bookingReference: '',
    image: '',
    rating: '',
    duration: '',
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [showNotes, setShowNotes] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        type: initialData.type || 'SIGHTSEEING',
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        location: initialData.location || '',
        cost: initialData.cost || '',
        currency: initialData.currency || 'USD',
        notes: initialData.notes || '',
        bookingReference: initialData.bookingReference || '',
        image: initialData.image || '',
        rating: initialData.rating || '',
        duration: initialData.duration || '',
      });
      
      if (initialData.notes || initialData.image || initialData.bookingReference) {
        setActiveTab('details');
      }
    } else {
      setFormData({
        name: '',
        type: 'SIGHTSEEING',
        startTime: '',
        endTime: '',
        location: '',
        cost: '',
        currency: 'USD',
        notes: '',
        bookingReference: '',
        image: '',
        rating: '',
        duration: '',
      });
      setActiveTab('basic');
    }
    setErrors({});
    setTouched({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Activity name is required';
        break;
      case 'cost':
        if (value && isNaN(value)) error = 'Must be a valid number';
        break;
      case 'duration':
        if (value && isNaN(value)) error = 'Must be a valid number';
        break;
      case 'rating':
        if (value && (value < 0 || value > 5)) error = 'Rating must be between 0 and 5';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Activity name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        cost: formData.cost ? Number(formData.cost) : 0,
        duration: formData.duration ? Number(formData.duration) : undefined,
        rating: formData.rating ? Number(formData.rating) : undefined,
        day,
        date: date.toISOString().split('T')[0],
      });
    }
  };

  // Calculate if end time is valid
  const isEndTimeValid = () => {
    if (!formData.startTime || !formData.endTime) return true;
    return formData.endTime > formData.startTime;
  };

  // Get suggested times based on type
  const getSuggestedTimes = () => {
    const suggestions = {
      SIGHTSEEING: ['09:00', '10:00', '14:00', '15:00'],
      FOOD: ['12:00', '13:00', '19:00', '20:00'],
      ADVENTURE: ['08:00', '09:00', '10:00'],
      CULTURAL: ['10:00', '11:00', '14:00', '15:00'],
      SHOPPING: ['10:00', '11:00', '14:00', '15:00'],
      NIGHTLIFE: ['20:00', '21:00', '22:00'],
    };
    return suggestions[formData.type] || ['09:00', '12:00', '15:00', '18:00'];
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop with blur */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-white rounded-t-2xl border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">
                {initialData ? '✏️' : '➕'}
              </span>
              {initialData ? 'Edit Activity' : 'Add Activity'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-2"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Date/Time Info */}
          {date && (
            <div className="px-6 py-3 bg-primary-50 border-b border-primary-100">
              <div className="flex items-center justify-between text-sm text-primary-700">
                <div className="flex items-center">
                  <span className="font-medium">Day {day}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                {initialData && (
                  <span className="text-xs bg-white px-2 py-1 rounded-full">
                    ID: {initialData.id}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('basic')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'basic'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Basic Details
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Additional Details
              </button>
            </nav>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form id="activity-form" onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'basic' && (
                <>
                  {/* Activity Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                        touched.name && errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Visit Eiffel Tower"
                    />
                    {touched.name && errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Activity Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                      {ACTIVITY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time Section */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Time
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                            !isEndTimeValid() && formData.endTime ? 'border-yellow-300 bg-yellow-50' : 'border-gray-300'
                          }`}
                        />
                        {!isEndTimeValid() && formData.endTime && (
                          <p className="mt-1 text-xs text-yellow-600">
                            End time should be after start time
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Suggested Times */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Suggested times:</p>
                      <div className="flex flex-wrap gap-2">
                        {getSuggestedTimes().map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, startTime: time }));
                              if (time) {
                                const [hours, minutes] = time.split(':');
                                const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
                                setFormData(prev => ({ ...prev, endTime: `${endHour}:${minutes}` }));
                              }
                            }}
                            className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-primary-50 hover:border-primary-300 transition-colors"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="Address or place name"
                      />
                    </div>
                  </div>

                  {/* Cost Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      Cost (Optional)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          name="cost"
                          value={formData.cost}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          min="0"
                          step="0.01"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                            touched.cost && errors.cost ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                        />
                        {touched.cost && errors.cost && (
                          <p className="mt-1 text-xs text-red-600">{errors.cost}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Currency
                        </label>
                        <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
                        >
                          {CURRENCIES.map(currency => (
                            <option key={currency.code} value={currency.code}>
                              {currency.symbol} {currency.code}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'details' && (
                <>
                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min="0"
                      step="15"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                        touched.duration && errors.duration ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 60"
                    />
                    {touched.duration && errors.duration && (
                      <p className="mt-1 text-xs text-red-600">{errors.duration}</p>
                    )}
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating (0-5)
                    </label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min="0"
                      max="5"
                      step="0.1"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                        touched.rating && errors.rating ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="4.5"
                    />
                    {touched.rating && errors.rating && (
                      <p className="mt-1 text-xs text-red-600">{errors.rating}</p>
                    )}
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <div className="relative">
                      <PhotoIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  {/* Booking Reference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Booking Reference
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="bookingReference"
                        value={formData.bookingReference}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g., FL123456"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Any additional details..."
                    />
                  </div>
                </>
              )}

              {/* Validation Summary */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Please fix the following errors:</p>
                    <ul className="list-disc list-inside mt-1">
                      {Object.values(errors).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Sticky Footer Actions */}
          <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-b-2xl px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="activity-form"
              className="px-6 py-2.5 text-sm font-medium text-gray-800 bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all shadow-sm"
            >
              {initialData ? 'Update Activity' : 'Save Activity'}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ActivityForm;