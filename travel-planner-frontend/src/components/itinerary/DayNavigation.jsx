import React from 'react';
import { format, isToday, isFuture, isPast } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const DayNavigation = ({ days, currentDay, onDayChange, activityCounts = {} }) => {
  const currentDayData = days.find(d => d.day === currentDay);
  
  // Get day status for visual indicators
  const getDayStatus = (date) => {
    if (isToday(date)) return 'today';
    if (isPast(date) && !isToday(date)) return 'past';
    if (isFuture(date)) return 'future';
    return '';
  };

  // Get day progress color
  const getDayColor = (day) => {
    const count = activityCounts[day] || 0;
    if (count === 0) return 'bg-gray-200';
    if (count < 3) return 'bg-blue-400';
    if (count < 6) return 'bg-green-400';
    return 'bg-purple-400';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      {/* Main Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onDayChange(currentDay - 1)}
          disabled={currentDay === 1}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
          aria-label="Previous day"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-3">
            <h3 className="text-2xl font-bold text-gray-900">
              Day {currentDay}
            </h3>
            
            {/* Today Badge */}
            {currentDayData && isToday(currentDayData.date) && (
              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                Today
              </span>
            )}
          </div>
          
          {currentDayData && (
            <p className="text-sm text-gray-500 mt-1">
              {format(currentDayData.date, 'EEEE, MMMM d, yyyy')}
            </p>
          )}

          {/* Activity Count for Current Day */}
          {activityCounts[currentDay] > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              {activityCounts[currentDay]} activities planned
            </p>
          )}
        </div>

        <button
          onClick={() => onDayChange(currentDay + 1)}
          disabled={currentDay === days.length}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
          aria-label="Next day"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Enhanced Day Dots with Tooltips */}
      <div className="flex justify-center space-x-2 mt-6">
        {days.map((day) => {
          const status = getDayStatus(day.date);
          const activityCount = activityCounts[day.day] || 0;
          const isActive = day.day === currentDay;
          
          return (
            <div key={day.day} className="relative group">
              <button
                onClick={() => onDayChange(day.day)}
                className={`
                  h-2 rounded-full transition-all duration-200
                  ${isActive 
                    ? 'w-6 bg-primary-600' 
                    : `w-2 ${getDayColor(day.day)} hover:scale-125`
                  }
                `}
                title={`Day ${day.day}: ${activityCount} activities`}
              />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Day {day.day}
                {activityCount > 0 && ` • ${activityCount} activities`}
                {status === 'today' && ' • Today'}
              </div>

              {/* Weekend Indicator */}
              {day.date && [0, 6].includes(day.date.getDay()) && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Jump Dropdown (for trips with many days) */}
      {days.length > 7 && (
        <div className="mt-4 flex justify-center">
          <select
            value={currentDay}
            onChange={(e) => onDayChange(parseInt(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            aria-label="Jump to day"
          >
            {days.map((day) => (
              <option key={day.day} value={day.day}>
                Day {day.day} - {format(day.date, 'MMM d')}
                {activityCounts[day.day] > 0 && ` (${activityCounts[day.day]} activities)`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-gray-200 rounded-full mr-1" />
          <span>No activities</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-1" />
          <span>1-2 activities</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-1" />
          <span>3-5 activities</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-purple-400 rounded-full mr-1" />
          <span>6+ activities</span>
        </div>
      </div>
    </div>
  );
};

export default DayNavigation;