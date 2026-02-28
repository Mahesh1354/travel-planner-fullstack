import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { 
  XMarkIcon, 
  TagIcon,
  DocumentTextIcon,
  ScaleIcon,
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const AddCustomItemModal = ({ isOpen, onClose, onSave, categoryId, initialData }) => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('medium');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setItemName(initialData.name || '');
      setQuantity(initialData.quantity || 1);
      setNotes(initialData.notes || '');
      setPriority(initialData.priority || 'medium');
    } else {
      setItemName('');
      setQuantity(1);
      setNotes('');
      setPriority('medium');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!itemName.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (quantity > 99) {
      newErrors.quantity = 'Quantity cannot exceed 99';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSave({
      id: initialData?.id,
      name: itemName.trim(),
      quantity,
      notes,
      category: categoryId,
      completed: initialData?.completed || false,
      isCustom: true,
      priority,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    });

    if (!initialData) {
      setItemName('');
      setQuantity(1);
      setNotes('');
      setPriority('medium');
    }
    onClose();
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <SparklesIcon className="h-5 w-5 text-primary-600 mr-2" />
              {initialData ? 'Edit Custom Item' : 'Add Custom Item'}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-2"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="e.g., Special medicine, Camera lens"
                  autoFocus
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Quantity & Priority Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  max="99"
                  className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white ${
                    errors.quantity ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.quantity}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority Preview */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Priority:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                priorityOptions.find(p => p.value === priority)?.color
              }`}>
                {priorityOptions.find(p => p.value === priority)?.label}
              </span>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (Optional)
              </label>
              <div className="relative">
                <DocumentTextIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Any additional details..."
                />
              </div>
            </div>

            {/* Info Tip */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Custom items are saved locally and will persist across sessions.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                {initialData ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default AddCustomItemModal;