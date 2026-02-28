import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { 
  XMarkIcon, 
  InformationCircleIcon,
  ReceiptPercentIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  DocumentTextIcon,
  CameraIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { BUDGET_CATEGORIES, CURRENCIES } from '../../utils/constants';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ExpenseForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  tripId, 
  selectedCurrency = 'USD',
  maxDate = new Date(),
  minDate,
  onReceiptUpload 
}) => {
  const [formData, setFormData] = useState({
    category: 'FOOD',
    description: '',
    estimatedAmount: '',
    actualAmount: '',
    currency: selectedCurrency,
    expenseDate: new Date(),
    notes: '',
    isPaid: false,
    merchant: '',
    receipt: null,
    tags: [],
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showReceipt, setShowReceipt] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Fetch trip dates for validation
  useEffect(() => {
    if (tripId) {
      // You can fetch trip details here if needed
    }
  }, [tripId]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || 'FOOD',
        description: initialData.description || '',
        estimatedAmount: initialData.estimatedAmount || '',
        actualAmount: initialData.actualAmount || '',
        currency: initialData.currency || selectedCurrency,
        expenseDate: initialData.expenseDate ? new Date(initialData.expenseDate) : new Date(),
        notes: initialData.notes || '',
        isPaid: initialData.isPaid || false,
        merchant: initialData.merchant || '',
        receipt: initialData.receipt || null,
        tags: initialData.tags || [],
      });
    } else {
      setFormData({
        category: 'FOOD',
        description: '',
        estimatedAmount: '',
        actualAmount: '',
        currency: selectedCurrency,
        expenseDate: new Date(),
        notes: '',
        isPaid: false,
        merchant: '',
        receipt: null,
        tags: [],
      });
    }
    setErrors({});
    setTouched({});
    setCurrentStep(1);
  }, [initialData, isOpen, selectedCurrency]);

  const validateField = (name, value) => {
    switch (name) {
      case 'description':
        return !value ? 'Description is required' : '';
      case 'estimatedAmount':
        if (value && isNaN(Number(value))) return 'Must be a valid number';
        if (value && Number(value) < 0) return 'Amount cannot be negative';
        if (value && Number(value) > 1000000) return 'Amount seems too high';
        return '';
      case 'actualAmount':
        if (value && isNaN(Number(value))) return 'Must be a valid number';
        if (value && Number(value) < 0) return 'Amount cannot be negative';
        if (value && Number(value) > 1000000) return 'Amount seems too high';
        return '';
      case 'merchant':
        if (value && value.length > 100) return 'Merchant name too long';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, expenseDate: date }));
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, receipt: 'File size must be less than 5MB' }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, receipt: 'File must be an image' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, receipt: reader.result }));
        setErrors(prev => ({ ...prev, receipt: '' }));
        if (onReceiptUpload) onReceiptUpload(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.description) newErrors.description = 'Description is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const allTouched = {};
      Object.keys(formData).forEach(key => allTouched[key] = true);
      setTouched(allTouched);
      return;
    }

    onSave({
      ...formData,
      estimatedAmount: formData.estimatedAmount ? Number(formData.estimatedAmount) : 0,
      actualAmount: formData.actualAmount ? Number(formData.actualAmount) : 0,
      expenseDate: formData.expenseDate.toISOString().split('T')[0],
      tripId,
    });
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: ReceiptPercentIcon },
    { number: 2, title: 'Amount', icon: CurrencyDollarIcon },
    { number: 3, title: 'Details', icon: DocumentTextIcon },
  ];

  const renderStep1 = () => (
    <div className="space-y-4 animate-fade-in">
      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BUDGET_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
              className={`p-3 border rounded-lg text-center transition-all ${
                formData.category === cat.value
                  ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl block mb-1">{cat.icon}</span>
              <span className="text-xs font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
            touched.description && errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Dinner at restaurant, Flight tickets"
        />
        {touched.description && errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Merchant (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Merchant / Vendor
        </label>
        <input
          type="text"
          name="merchant"
          value={formData.merchant}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          placeholder="e.g., United Airlines, Hilton Hotel"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 animate-fade-in">
      {/* Amounts Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Estimated Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {CURRENCIES.find(c => c.code === formData.currency)?.symbol || '$'}
            </span>
            <input
              type="number"
              name="estimatedAmount"
              value={formData.estimatedAmount}
              onChange={handleChange}
              onBlur={handleBlur}
              min="0"
              step="0.01"
              className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                touched.estimatedAmount && errors.estimatedAmount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
          </div>
          {touched.estimatedAmount && errors.estimatedAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.estimatedAmount}</p>
          )}
        </div>

        {/* Actual Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Actual
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {CURRENCIES.find(c => c.code === formData.currency)?.symbol || '$'}
            </span>
            <input
              type="number"
              name="actualAmount"
              value={formData.actualAmount}
              onChange={handleChange}
              onBlur={handleBlur}
              min="0"
              step="0.01"
              className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                touched.actualAmount && errors.actualAmount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
          </div>
          {touched.actualAmount && errors.actualAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.actualAmount}</p>
          )}
        </div>
      </div>

      {/* Currency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Currency
        </label>
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all bg-white"
        >
          {CURRENCIES.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.code} - {currency.name}
            </option>
          ))}
        </select>
      </div>

      {/* Helper text */}
      <div className="flex items-start space-x-2 bg-blue-50 p-3 rounded-lg">
        <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <span className="font-medium">Tip:</span> Enter estimated amount for planning, 
          and update with actual amount after purchase. Leave actual empty if not yet spent.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 animate-fade-in">
      {/* Date and Paid Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expense Date
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <DatePicker
              selected={formData.expenseDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              maxDate={maxDate}
              minDate={minDate}
              placeholderText="Select date"
            />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg w-full">
            <input
              type="checkbox"
              name="isPaid"
              id="isPaid"
              checked={formData.isPaid}
              onChange={handleChange}
              className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-all"
            />
            <label htmlFor="isPaid" className="text-sm text-gray-700 select-none">
              Mark as paid
            </label>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="relative">
          <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            placeholder="Type and press Enter to add tags"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        
        {/* Tag List */}
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Receipt
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors">
          <div className="space-y-1 text-center">
            {formData.receipt ? (
              <div className="relative">
                <img 
                  src={formData.receipt} 
                  alt="Receipt preview" 
                  className="max-h-32 mx-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, receipt: null }))}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="receipt-upload"
                    className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-700 focus-within:outline-none"
                  >
                    <span>Upload a receipt</span>
                    <input
                      id="receipt-upload"
                      name="receipt-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
        {errors.receipt && (
          <p className="mt-1 text-xs text-red-600">{errors.receipt}</p>
        )}
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
          rows="3"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
          placeholder="Any additional details about this expense..."
        />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {initialData ? 'Edit Expense' : 'Add New Expense'}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-2"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <React.Fragment key={step.number}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(step.number)}
                      className="flex flex-col items-center"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-primary-600 text-white scale-110 shadow-lg'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? (
                          <span className="text-lg">✓</span>
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${
                        isActive ? 'text-primary-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </span>
                    </button>
                    
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </form>

          {/* Footer */}
          <div className="flex justify-between p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
              disabled={currentStep === 1}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all shadow-sm"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all shadow-sm"
                >
                  {initialData ? 'Update Expense' : 'Add Expense'}
                </button>
              )}
            </div>
          </div>
        </DialogPanel>
      </div>

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
    </Dialog>
  );
};

export default ExpenseForm;