import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
  CalendarIcon, 
  MapPinIcon, 
  PencilIcon,
  GlobeAltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const schema = yup.object({
  title: yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: yup.string()
    .max(500, 'Description must be less than 500 characters'),
  destination: yup.string()
    .required('Destination is required')
    .min(2, 'Destination must be at least 2 characters'),
  isPublic: yup.boolean(),
  budget: yup.number()
    .positive('Budget must be positive')
    .typeError('Budget must be a number'),
  currency: yup.string(),
});

const TripForm = ({ 
  initialData, 
  onSubmit, 
  loading,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [touched, setTouched] = useState({});
  const [dateError, setDateError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: initialData || {
      title: '',
      description: '',
      destination: '',
      isPublic: false,
      budget: '',
      currency: 'USD',
    },
  });

  const formValues = watch();

  // Validate dates whenever they change
  useEffect(() => {
    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        setDateError('End date must be after start date');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  }, [startDate, endDate]);

  const steps = [
    { number: 1, title: 'Basic Info', icon: PencilIcon },
    { number: 2, title: 'Destination', icon: MapPinIcon },
    { number: 3, title: 'Dates & Budget', icon: CalendarIcon },
    { number: 4, title: 'Privacy', icon: GlobeAltIcon },
  ];

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) fieldsToValidate = ['title'];
    if (currentStep === 2) fieldsToValidate = ['destination'];
    if (currentStep === 3) fieldsToValidate = [];
    
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid && !(currentStep === 3 && dateError)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFormSubmit = (data) => {
    if (dateError) {
      alert(dateError);
      return;
    }
    onSubmit(data);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldStatus = (field) => {
    if (!touched[field] && !formValues[field]) return 'pending';
    if (errors[field]) return 'error';
    if (formValues[field]) return 'completed';
    return 'pending';
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StatusIcon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white scale-110 shadow-lg'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircleIconSolid className="h-5 w-5" />
                  ) : (
                    <StatusIcon className="h-5 w-5" />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  currentStep > step.number + 1 ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label htmlFor="title" className="input-label flex items-center">
          Trip Title <span className="text-red-500 ml-1">*</span>
          {getFieldStatus('title') === 'completed' && (
            <CheckCircleIconSolid className="h-4 w-4 text-green-500 ml-2" />
          )}
        </label>
        <input
          {...register('title')}
          type="text"
          onBlur={() => handleBlur('title')}
          className={`input-field transition-all ${
            touched.title && errors.title
              ? 'border-red-500 focus:ring-red-500'
              : touched.title && !errors.title
              ? 'border-green-500 focus:ring-green-500'
              : ''
          }`}
          placeholder="e.g., Summer in Europe, Bali Adventure"
        />
        <div className="flex justify-between mt-1">
          {touched.title && errors.title ? (
            <p className="error-text">{errors.title.message}</p>
          ) : (
            <p className="text-xs text-gray-400">
              Choose a memorable name for your trip
            </p>
          )}
          <span className="text-xs text-gray-400">
            {formValues.title?.length || 0}/100
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="input-label">Description</label>
        <textarea
          {...register('description')}
          rows="4"
          className="input-field resize-none"
          placeholder="Tell us about your trip, your plans, and what you're excited about..."
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-400">
            {formValues.description?.length || 0}/500
          </span>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label htmlFor="destination" className="input-label flex items-center">
          Destination <span className="text-red-500 ml-1">*</span>
          {getFieldStatus('destination') === 'completed' && (
            <CheckCircleIconSolid className="h-4 w-4 text-green-500 ml-2" />
          )}
        </label>
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            {...register('destination')}
            type="text"
            onBlur={() => handleBlur('destination')}
            className={`input-field pl-10 ${
              touched.destination && errors.destination
                ? 'border-red-500 focus:ring-red-500'
                : touched.destination && !errors.destination
                ? 'border-green-500 focus:ring-green-500'
                : ''
            }`}
            placeholder="e.g., Paris, France"
          />
        </div>
        {touched.destination && errors.destination ? (
          <p className="error-text mt-1">{errors.destination.message}</p>
        ) : (
          <p className="text-xs text-gray-400 mt-1">
            Enter city and country (e.g., "Paris, France")
          </p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="input-label flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={onStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="input-field w-full"
            dateFormat="MMMM d, yyyy"
            placeholderText="Select start date"
            minDate={new Date()}
          />
        </div>
        <div>
          <label className="input-label flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="input-field w-full"
            dateFormat="MMMM d, yyyy"
            placeholderText="Select end date"
          />
        </div>
      </div>

      {dateError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-600">{dateError}</p>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
          <InformationCircleIcon className="h-4 w-4 mr-1" />
          Optional Budget
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-600">Estimated Budget</label>
            <input
              {...register('budget')}
              type="number"
              placeholder="0.00"
              className="input-field mt-1"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Currency</label>
            <select
              {...register('currency')}
              className="input-field mt-1"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>
      </div>

      {startDate && endDate && !dateError && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700 flex items-center">
            <CheckCircleIconSolid className="h-4 w-4 mr-2" />
            Trip duration: {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1} days
          </p>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              {...register('isPublic')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
              Make this trip public
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Public trips can be discovered by other users and used as templates for their own adventures.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
        <h4 className="text-sm font-medium text-primary-800 mb-2">✨ Ready to create!</h4>
        <p className="text-xs text-primary-600">
          You're all set! Review your information and click "Create Trip" to start planning your adventure.
        </p>
      </div>

      {/* Summary */}
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
        <div className="p-3 flex justify-between">
          <span className="text-sm text-gray-600">Trip Name:</span>
          <span className="text-sm font-medium text-gray-900">{formValues.title || 'Not set'}</span>
        </div>
        <div className="p-3 flex justify-between">
          <span className="text-sm text-gray-600">Destination:</span>
          <span className="text-sm font-medium text-gray-900">{formValues.destination || 'Not set'}</span>
        </div>
        {startDate && endDate && (
          <div className="p-3 flex justify-between">
            <span className="text-sm text-gray-600">Duration:</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1} days
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Edit Trip' : 'Create New Trip'}
        </h1>
        <p className="text-gray-600 mt-2">
          {initialData 
            ? 'Update your trip details' 
            : 'Start planning your next adventure'
          }
        </p>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all flex items-center shadow-sm"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !!dateError}
              className="px-8 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Creating...' : initialData ? 'Update Trip' : 'Create Trip'}
            </button>
          )}
        </div>
      </form>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TripForm;