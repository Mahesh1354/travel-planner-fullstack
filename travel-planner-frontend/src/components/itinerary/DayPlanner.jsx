import React, { useState } from 'react';
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import ActivityCard from './ActivityCard';
import { format } from 'date-fns';

const DayPlanner = ({ 
  day, 
  date, 
  activities = [], 
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onToggleComplete,
  weather,
  onReorderActivities,
  summary = false // New prop for collapsed view
}) => {
  const [isExpanded, setIsExpanded] = useState(!summary);
  const [showCompleted, setShowCompleted] = useState(true);

  // Sort activities by time
  const sortedActivities = [...activities].sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  const completedActivities = activities.filter(a => a.completed);
  const pendingActivities = activities.filter(a => !a.completed);
  const completedCount = completedActivities.length;
  const totalCount = activities.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate total cost for the day
  const totalCost = activities.reduce((sum, activity) => {
    return sum + (activity.cost || 0);
  }, 0);

  // Get time slots (morning, afternoon, evening)
  const getTimeSlot = (time) => {
    if (!time) return 'Anytime';
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  const morningActivities = activities.filter(a => 
    a.startTime && parseInt(a.startTime.split(':')[0]) < 12
  );
  const afternoonActivities = activities.filter(a => 
    a.startTime && parseInt(a.startTime.split(':')[0]) >= 12 && parseInt(a.startTime.split(':')[0]) < 17
  );
  const eveningActivities = activities.filter(a => 
    a.startTime && parseInt(a.startTime.split(':')[0]) >= 17
  );
  const unscheduledActivities = activities.filter(a => !a.startTime);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Day Header */}
      <div 
        className={`bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 cursor-pointer ${
          isExpanded ? '' : 'hover:from-primary-100 hover:to-primary-200'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Day {day}
              </h2>
              
              {/* Stats Badges */}
              {totalCount > 0 && (
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    progress === 100 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {progress}% complete
                  </span>
                  {totalCost > 0 && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      ${totalCost}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-1">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Weather Widget */}
            {weather && (
              <div className="hidden sm:flex items-center bg-white/50 rounded-lg px-3 py-2">
                <span className="text-2xl mr-2">{weather.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{weather.temp}°C</p>
                  <p className="text-xs text-gray-600">{weather.condition}</p>
                </div>
              </div>
            )}

            {/* Expand/Collapse Button */}
            <button className="p-1 hover:bg-white/50 rounded-full transition-colors">
              {isExpanded ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar - Always visible */}
        {totalCount > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Daily Progress</span>
              <span>{completedCount}/{totalCount} activities</span>
            </div>
            <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6">
          {totalCount === 0 ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No activities planned
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Start planning your day by adding activities, or explore recommendations for {format(date, 'MMMM d')}
              </p>
              <button
                onClick={() => onAddActivity(day)}
                className="btn-primary inline-flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add First Activity
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Time-based Activity Groups */}
              {morningActivities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">🌅 Morning</h4>
                  <div className="space-y-3">
                    {morningActivities.map(activity => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onEdit={onEditActivity}
                        onDelete={onDeleteActivity}
                        onToggleComplete={onToggleComplete}
                        showTime
                      />
                    ))}
                  </div>
                </div>
              )}

              {afternoonActivities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">☀️ Afternoon</h4>
                  <div className="space-y-3">
                    {afternoonActivities.map(activity => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onEdit={onEditActivity}
                        onDelete={onDeleteActivity}
                        onToggleComplete={onToggleComplete}
                        showTime
                      />
                    ))}
                  </div>
                </div>
              )}

              {eveningActivities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">🌙 Evening</h4>
                  <div className="space-y-3">
                    {eveningActivities.map(activity => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onEdit={onEditActivity}
                        onDelete={onDeleteActivity}
                        onToggleComplete={onToggleComplete}
                        showTime
                      />
                    ))}
                  </div>
                </div>
              )}

              {unscheduledActivities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">⏰ Anytime</h4>
                  <div className="space-y-3">
                    {unscheduledActivities.map(activity => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onEdit={onEditActivity}
                        onDelete={onDeleteActivity}
                        onToggleComplete={onToggleComplete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Activities Toggle */}
              {completedActivities.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <span className="mr-2">{showCompleted ? '▼' : '▶'}</span>
                    Show {completedActivities.length} completed activities
                  </button>
                  
                  {showCompleted && (
                    <div className="mt-4 space-y-3 opacity-75">
                      {completedActivities.map(activity => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          onEdit={onEditActivity}
                          onDelete={onDeleteActivity}
                          onToggleComplete={onToggleComplete}
                          compact
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add Activity Button */}
              <button
                onClick={() => onAddActivity(day)}
                className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center group"
              >
                <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Add Another Activity
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary View (when collapsed) */}
      {!isExpanded && totalCount > 0 && (
        <div className="px-6 pb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>{totalCount} activities</span>
            <span>•</span>
            <span>{completedCount} completed</span>
            {totalCost > 0 && (
              <>
                <span>•</span>
                <span>${totalCost}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DayPlanner;