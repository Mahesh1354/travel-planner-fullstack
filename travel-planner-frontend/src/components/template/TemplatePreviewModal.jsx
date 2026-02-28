import React from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, MapPinIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const TemplatePreviewModal = ({ isOpen, onClose, template, onUseTemplate }) => {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header with image */}
          <div className="relative h-48">
            <img
              src={template.image}
              alt={template.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-700" />
            </button>
            
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-2xl font-bold">{template.title}</h2>
              <div className="flex items-center mt-1">
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span>{template.destination}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 mb-6">{template.description}</p>

            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-primary-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">{template.duration} Days</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 text-primary-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">${template.budget}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl mb-1 block">📍</span>
                <p className="text-sm font-medium text-gray-900">{template.highlights.length} Stops</p>
              </div>
            </div>

            {/* Highlights */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {template.highlights.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Daily Itinerary */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Daily Itinerary</h3>
              <div className="space-y-3">
                {template.activities.map((day, index) => (
                  <div key={index} className="border-l-4 border-primary-200 pl-4">
                    <p className="text-sm font-medium text-gray-900">Day {day.day}</p>
                    <ul className="mt-1 space-y-1">
                      {day.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="text-primary-600 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  onUseTemplate(template);
                  onClose();
                }}
                className="flex-1 btn-primary"
              >
                Use This Template
              </button>
              <button
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TemplatePreviewModal;