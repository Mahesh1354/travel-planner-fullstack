import React, { useState } from 'react';
import { 
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Sunrise,
  Sunset,
  Eye,
  Compass,
  CloudSun,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const WeatherCard = ({ weather, loading, error, onRefresh }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Debug log
  console.log('WeatherCard received:', { weather, loading, error });

  // Helper to convert timestamp to time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get weather condition color
  const getWeatherColor = () => {
    if (!weather?.description) return 'from-blue-500 to-blue-600';
    
    const desc = weather.description.toLowerCase();
    if (desc.includes('clear')) return 'from-yellow-500 to-orange-500';
    if (desc.includes('cloud')) return 'from-gray-500 to-gray-600';
    if (desc.includes('rain')) return 'from-blue-600 to-indigo-700';
    if (desc.includes('snow')) return 'from-cyan-400 to-blue-500';
    if (desc.includes('thunder')) return 'from-purple-600 to-purple-800';
    if (desc.includes('mist') || desc.includes('fog')) return 'from-gray-400 to-gray-500';
    return 'from-blue-500 to-blue-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
            <div>
              <div className="h-10 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-5 w-5 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-8 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-lg font-medium text-red-600 mb-2">Weather Unavailable</p>
          <p className="text-sm text-gray-500 mb-4">{typeof error === 'string' ? error : error.message}</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <CloudSun className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No weather data available</p>
        </div>
      </div>
    );
  }

  const weatherColor = getWeatherColor();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
      {/* Header with Gradient */}
      <div className={`bg-gradient-to-r ${weatherColor} px-6 py-4 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">Current Weather</h3>
            <p className="text-white/90 text-sm">
              {weather.city}, {weather.country}
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              title="Refresh weather"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Weather Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {weather.iconUrl && (
              <div className="relative">
                <img 
                  src={weather.iconUrl} 
                  alt={weather.description}
                  className="w-20 h-20 drop-shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {weather.uvIndex && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {weather.uvIndex}
                  </div>
                )}
              </div>
            )}
            <div className="ml-4">
              <div className="flex items-baseline">
                <p className="text-5xl font-bold text-gray-900">
                  {Math.round(weather.temperature)}°
                </p>
                <span className="text-2xl text-gray-500 ml-1">C</span>
              </div>
              <p className="text-gray-600 capitalize flex items-center mt-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                {weather.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Feels like</p>
            <p className="text-3xl font-semibold text-gray-800">
              {Math.round(weather.feelsLike || weather.temperature)}°C
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {weather.tempMin && weather.tempMax && (
                <>↓{Math.round(weather.tempMin)}° ↑{Math.round(weather.tempMax)}°</>
              )}
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-xl p-3 text-center hover:bg-blue-100 transition-colors">
            <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-semibold text-gray-900">{weather.humidity || 0}%</p>
            <p className="text-xs text-gray-500">Humidity</p>
          </div>
          <div className="bg-teal-50 rounded-xl p-3 text-center hover:bg-teal-100 transition-colors">
            <Wind className="h-5 w-5 text-teal-500 mx-auto mb-1" />
            <p className="text-lg font-semibold text-gray-900">{weather.windSpeed || 0} m/s</p>
            <p className="text-xs text-gray-500">Wind</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center hover:bg-orange-100 transition-colors">
            <Gauge className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-lg font-semibold text-gray-900">{weather.pressure || 0} hPa</p>
            <p className="text-xs text-gray-500">Pressure</p>
          </div>
        </div>

        {/* Toggle Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center py-2 border-t border-gray-100 mt-2"
        >
          {showDetails ? 'Show less' : 'Show more details'}
          <span className="ml-1">{showDetails ? '↑' : '↓'}</span>
        </button>

        {/* Extended Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3 animate-slide-down">
            {/* Sunrise & Sunset */}
            <div className="grid grid-cols-2 gap-4">
              {weather.sunrise && (
                <div className="flex items-center bg-amber-50 p-3 rounded-lg">
                  <Sunrise className="h-5 w-5 text-amber-600 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Sunrise</p>
                    <p className="text-sm font-medium text-gray-900">{formatTime(weather.sunrise)}</p>
                  </div>
                </div>
              )}
              {weather.sunset && (
                <div className="flex items-center bg-indigo-50 p-3 rounded-lg">
                  <Sunset className="h-5 w-5 text-indigo-600 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Sunset</p>
                    <p className="text-sm font-medium text-gray-900">{formatTime(weather.sunset)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {weather.visibility && (
                <div className="flex items-center">
                  <Eye className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Visibility: {(weather.visibility / 1000).toFixed(1)}km</span>
                </div>
              )}
              {weather.windDeg && (
                <div className="flex items-center">
                  <Compass className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Wind direction: {weather.windDeg}°</span>
                </div>
              )}
            </div>

            {/* Air Quality (if available) */}
            {weather.airQuality && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Air Quality</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">AQI: {weather.airQuality.aqi || 'N/A'}</span>
                  <div className="flex space-x-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">PM2.5: {weather.airQuality.pm2_5 || 0}</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">PM10: {weather.airQuality.pm10 || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WeatherCard;