import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from '@heroicons/react/24/outline';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="input-label">Start Date</label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
          <DatePicker
            selected={startDate}
            onChange={onStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            minDate={new Date()}
            className="input-field pl-10"
            dateFormat="MMMM d, yyyy"
            placeholderText="Select start date"
            required
          />
        </div>
      </div>

      <div>
        <label className="input-label">End Date</label>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
          <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || new Date()}
            className="input-field pl-10"
            dateFormat="MMMM d, yyyy"
            placeholderText="Select end date"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;