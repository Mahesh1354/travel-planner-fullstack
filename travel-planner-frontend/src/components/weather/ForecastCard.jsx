import React, { useState } from 'react';
import { 
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Wind
} from 'lucide-react';

const ForecastCard = ({ forecast }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!forecast || forecast.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No forecast data available</p>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % forecast.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + forecast.length) % forecast.length);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <CalendarDays className="h-5 w-5 mr-2" />
            5-Day Forecast
          </h3>
          {forecast.length > 1 && (
            <div className="flex space-x-2">
              <button
                onClick={prevSlide}
                className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Carousel View */}
      <div className="p-6">
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {forecast.map((day, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <div className="text-center mb-6">
                  <p className="text-2xl font-bold text-gray-900 mb-1">{day.day}</p>
                  <p className="text-sm text-gray-500">{new Date(day.date).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <img 
                    src={day.iconUrl} 
                    alt={day.description}
                    className="w-20 h-20"
                  />
                  <div className="ml-4 text-left">
                    <p className="text-4xl font-bold text-gray-900">{day.temperature}°C</p>
                    <p className="text-gray-600 capitalize">{day.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-gray-900">{day.humidity}%</p>
                    <p className="text-xs text-gray-500">Humidity</p>
                  </div>
                  <div className="bg-teal-50 rounded-xl p-3 text-center">
                    <Wind className="h-5 w-5 text-teal-500 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-gray-900">{day.windSpeed} m/s</p>
                    <p className="text-xs text-gray-500">Wind</p>
                  </div>
                </div>

                {day.feelsLike && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Feels like {day.feelsLike}°C
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dot Indicators */}
        {forecast.length > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            {forecast.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'w-6 bg-primary-600' 
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to day ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Table View (Alternative) */}
      <div className="border-t border-gray-200">
        <div className="divide-y divide-gray-100">
          {forecast.map((day, index) => (
            <div 
              key={index}
              className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span className="w-12 text-sm font-medium text-gray-700">
                  {day.day}
                </span>
                <img 
                  src={day.iconUrl} 
                  alt={day.description}
                  className="w-6 h-6"
                />
                <span className="text-sm text-gray-600 capitalize hidden sm:inline">
                  {day.description}
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-sm text-gray-500 hidden sm:inline">
                  {day.humidity}%
                </span>
                <span className="font-semibold text-gray-900">
                  {day.temperature}°C
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForecastCard;