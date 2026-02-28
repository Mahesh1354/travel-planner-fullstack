import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { 
  XMarkIcon, 
  DocumentArrowDownIcon,
  CalendarIcon,
  LinkIcon,
  CheckIcon,
  PrinterIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import exportService from '../../services/exportService';
import toast from 'react-hot-toast';

const ExportModal = ({ isOpen, onClose, trip, destinations, activities, activitiesByDay, days }) => {
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportType, setExportType] = useState(null);

  // Validate that we have the necessary data
  const hasData = trip && (destinations?.length > 0 || activities?.length > 0);

  const handleExportPDF = async (type) => {
    if (!trip) {
      toast.error('No trip data available to export');
      return;
    }

    setExporting(true);
    setExportType(type);
    
    try {
      let doc;
      let filename;
      
      if (type === 'full') {
        doc = await exportService.exportAsPDF(trip, destinations || [], activities || []);
        filename = `${trip.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'trip'}_details.pdf`;
        toast.success('Trip details exported successfully!');
      } else if (type === 'itinerary') {
        doc = await exportService.exportItineraryAsPDF(trip, activitiesByDay || {}, days || []);
        filename = `${trip.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'trip'}_itinerary.pdf`;
        toast.success('Itinerary exported successfully!');
      }
      
      if (doc) {
        exportService.downloadPDF(doc, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
      setExportType(null);
    }
  };

  const handleExportCalendar = () => {
    if (!trip) {
      toast.error('No trip data available to export');
      return;
    }

    try {
      const events = exportService.createCalendarEvent(trip, destinations || []);
      
      if (events && events.length > 0) {
        const icsContent = exportService.generateICSFile(events);
        if (icsContent) {
          const filename = `${trip.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'trip'}_calendar.ics`;
          exportService.downloadICS(icsContent, filename);
          toast.success(`${events.length} calendar event${events.length > 1 ? 's' : ''} created!`);
        }
      } else {
        toast.error('No events to export');
      }
    } catch (error) {
      console.error('Calendar export failed:', error);
      toast.error('Failed to create calendar event');
    }
  };

  const handleShareLink = () => {
    if (!trip?.id) {
      toast.error('No trip ID available');
      return;
    }

    const result = exportService.shareTripLink(trip.id);
    if (result) {
      setCopied(true);
      toast.success(result);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    // Add print-specific styling
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { 
          padding: 20px; 
          font-family: Arial, sans-serif;
        }
        .no-print { display: none; }
        .print-only { display: block; }
        h1 { color: #0284c7; font-size: 24px; }
        h2 { color: #333; font-size: 20px; margin-top: 20px; }
        .destination { margin: 15px 0; padding: 10px; border: 1px solid #ddd; }
        .activity { margin: 10px 0; padding: 8px; background: #f9f9f9; }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    // Remove the style after printing
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  // Show warning if no data
  if (!hasData && trip) {
    return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Export Trip
              </DialogTitle>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Limited Data to Export</h3>
              <p className="text-sm text-gray-600 mb-6">
                Your trip doesn't have any destinations or activities yet. 
                The exported document will contain only basic trip information.
              </p>
              <div className="flex space-x-3">
                <button onClick={onClose} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button 
                  onClick={() => handleExportPDF('full')} 
                  disabled={exporting}
                  className="flex-1 btn-primary"
                >
                  {exporting ? 'Exporting...' : 'Export Anyway'}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-xl max-h-[90vh] flex flex-col">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-white rounded-t-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Export Trip
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-sm text-gray-600 mb-4">
              Choose how you'd like to export your trip
            </p>

            <div className="space-y-3">
              {/* PDF Export Options */}
              <button
                onClick={() => handleExportPDF('full')}
                disabled={exporting}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  {exporting && exportType === 'full' ? (
                    <svg className="animate-spin h-6 w-6 text-primary-600 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <DocumentArrowDownIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Full Trip Details</p>
                    <p className="text-sm text-gray-500">Complete trip info with all destinations and activities</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExportPDF('itinerary')}
                disabled={exporting}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  {exporting && exportType === 'itinerary' ? (
                    <svg className="animate-spin h-6 w-6 text-primary-600 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <DocumentArrowDownIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Itinerary Only</p>
                    <p className="text-sm text-gray-500">Day-by-day schedule of activities</p>
                  </div>
                </div>
              </button>

              {/* Calendar Export */}
              <button
                onClick={handleExportCalendar}
                disabled={exporting}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center">
                  <CalendarIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Add to Calendar</p>
                    <p className="text-sm text-gray-500">Export as .ics file for Google/Apple Calendar</p>
                  </div>
                </div>
              </button>

              {/* Share Link */}
              <button
                onClick={handleShareLink}
                disabled={exporting}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center">
                  {copied ? (
                    <CheckIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
                  ) : (
                    <LinkIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Share Link</p>
                    <p className="text-sm text-gray-500">Copy trip link to clipboard</p>
                  </div>
                </div>
              </button>

              {/* Print Option */}
              <button
                onClick={handlePrint}
                disabled={exporting}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center">
                  <PrinterIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Print</p>
                    <p className="text-sm text-gray-500">Open print dialog for browser printing</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Export Status */}
            {exporting && (
              <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700 text-center">
                  Generating your document... Please wait.
                </p>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 rounded-b-xl px-6 py-4">
            <button
              onClick={onClose}
              disabled={exporting}
              className="w-full btn-secondary disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ExportModal;