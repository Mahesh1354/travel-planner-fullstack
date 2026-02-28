import React, { useState, useEffect } from 'react';
import weatherAPI from '../../api/weather';
import { 
  CloudSunIcon, 
  Loader2,
  AlertCircle,
  RefreshCw,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  CloudLightning
} from 'lucide-react';

const WeatherWidget = ({ destination, date, onRefresh, compact = false }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!destination) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Extract city name from destination string
        const cityName = destination.split(',')[0].trim();
        const response = await weatherAPI.getCurrentWeather(cityName);
        setWeather(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [destination]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const cityName = destination.split(',')[0].trim();
      const response = await weatherAPI.getCurrentWeather(cityName);
      setWeather(response.data);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = () => {
    if (!weather?.description) return <CloudSun className="h-4 w-4" />;
    
    const desc = weather.description.toLowerCase();
    if (desc.includes('clear')) return <Sun className="h-4 w-4 text-yellow-500" />;
    if (desc.includes('cloud')) return <Cloud className="h-4 w-4 text-gray-500" />;
    if (desc.includes('rain')) return <CloudRain className="h-4 w-4 text-blue-500" />;
    if (desc.includes('snow')) return <Snowflake className="h-4 w-4 text-cyan-500" />;
    if (desc.includes('thunder')) return <CloudLightning className="h-4 w-4 text-purple-500" />;
    return <CloudSun className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center shadow-sm border border-gray-200">
        <Loader2 className="h-4 w-4 animate-spin text-primary-600 mr-2" />
        <span className="text-sm text-gray-600">Loading weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center shadow-sm border border-gray-200">
        <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
        <span className="text-sm text-gray-500">Weather unavailable</span>
        <button
          onClick={handleRefresh}
          className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Retry"
        >
          <RefreshCw className="h-3 w-3 text-gray-400" />
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl px-3 py-2 flex items-center space-x-2 shadow-sm border border-primary-200">
        {getWeatherIcon()}
        <span className="text-sm font-medium text-gray-900">{weather.temperature}°C</span>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center space-x-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <img 
        src={weather.iconUrl} 
        alt={weather.description} 
        className="w-8 h-8"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentNode.querySelector('.fallback-icon')?.classList.remove('hidden');
        }}
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {weather.temperature}°C
          </p>
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-3 w-3 text-gray-400" />
          </button>
        </div>
        <p className="text-xs text-gray-500 capitalize">{weather.description}</p>
      </div>
    </div>
  );
};

export default WeatherWidget;