import { useState, useEffect, useCallback, useRef } from 'react';
import weatherAPI from '../api/weather';

// City name mappings for OpenWeatherMap
const CITY_MAPPINGS = {
  // Indian destinations
  'North Goa': 'Goa',
  'South Goa': 'Goa',
  'Goa': 'Goa',
  'Bombay': 'Mumbai',
  'Madras': 'Chennai',
  'Calcutta': 'Kolkata',
  'Bangalore': 'Bengaluru',
  'Poona': 'Pune',
  'Benares': 'Varanasi',
  'Cochin': 'Kochi',
  'Trivandrum': 'Thiruvananthapuram',
  'Mysore': 'Mysuru',
  'Pondicherry': 'Puducherry',
  'Baroda': 'Vadodara',
  'Ahmedabad': 'Ahmedabad',
  
  // US destinations
  'NYC': 'New York City',
  'NY': 'New York City',
  'New York': 'New York City',
  'LA': 'Los Angeles',
  'San Fran': 'San Francisco',
  'SF': 'San Francisco',
  'Vegas': 'Las Vegas',
  'Philly': 'Philadelphia',
  'DC': 'Washington DC',
  
  // UK destinations
  'London': 'London',
  'Manchester': 'Manchester',
  'Liverpool': 'Liverpool',
  'Edinburgh': 'Edinburgh',
  'Glasgow': 'Glasgow',
  
  // Europe
  'Rome': 'Rome',
  'Milan': 'Milan',
  'Venice': 'Venice',
  'Florence': 'Florence',
  'Paris': 'Paris',
  'Nice': 'Nice',
  'Lyon': 'Lyon',
  'Barcelona': 'Barcelona',
  'Madrid': 'Madrid',
  'Seville': 'Seville',
  'Granada': 'Granada',
  'Amsterdam': 'Amsterdam',
  'Berlin': 'Berlin',
  'Munich': 'Munich',
  'Hamburg': 'Hamburg',
  'Vienna': 'Vienna',
  'Prague': 'Prague',
  'Budapest': 'Budapest',
  'Krakow': 'Kraków',
  'Warsaw': 'Warsaw',
  
  // Asia
  'Tokyo': 'Tokyo',
  'Kyoto': 'Kyoto',
  'Osaka': 'Osaka',
  'Seoul': 'Seoul',
  'Busan': 'Busan',
  'Beijing': 'Beijing',
  'Shanghai': 'Shanghai',
  'Hong Kong': 'Hong Kong',
  'Taipei': 'Taipei',
  'Bangkok': 'Bangkok',
  'Phuket': 'Phuket',
  'Chiang Mai': 'Chiang Mai',
  'Singapore': 'Singapore',
  'Kuala Lumpur': 'Kuala Lumpur',
  'Bali': 'Denpasar',
  'Jakarta': 'Jakarta',
  'Ho Chi Minh City': 'Ho Chi Minh City',
  'Hanoi': 'Hanoi',
  'Da Nang': 'Da Nang',
  
  // Middle East
  'Dubai': 'Dubai',
  'Abu Dhabi': 'Abu Dhabi',
  'Doha': 'Doha',
  'Riyadh': 'Riyadh',
  'Jeddah': 'Jeddah',
  'Muscat': 'Muscat',
  'Kuwait City': 'Kuwait City',
  'Manama': 'Manama',
  
  // Australia/NZ
  'Sydney': 'Sydney',
  'Melbourne': 'Melbourne',
  'Brisbane': 'Brisbane',
  'Perth': 'Perth',
  'Adelaide': 'Adelaide',
  'Auckland': 'Auckland',
  'Wellington': 'Wellington',
  'Christchurch': 'Christchurch',
  
  // Africa
  'Cairo': 'Cairo',
  'Alexandria': 'Alexandria',
  'Cape Town': 'Cape Town',
  'Johannesburg': 'Johannesburg',
  'Durban': 'Durban',
  'Marrakech': 'Marrakech',
  'Casablanca': 'Casablanca',
  'Nairobi': 'Nairobi',
  'Lagos': 'Lagos',
  
  // South America
  'Rio de Janeiro': 'Rio de Janeiro',
  'Sao Paulo': 'São Paulo',
  'Brasilia': 'Brasília',
  'Salvador': 'Salvador',
  'Buenos Aires': 'Buenos Aires',
  'Santiago': 'Santiago',
  'Lima': 'Lima',
  'Bogota': 'Bogotá',
  'Quito': 'Quito',
  'Caracas': 'Caracas',
};

// Cache for weather data to reduce API calls
const weatherCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Cache for city name mappings to avoid repeated logging
const mappedCityCache = new Map();

// Helper function to get valid city name (with cached results)
const getValidCityName = (city) => {
  if (!city) return null;
  
  // Check cache first
  if (mappedCityCache.has(city)) {
    return mappedCityCache.get(city);
  }
  
  // Trim and clean the city name
  const cleanCity = city.trim();
  
  // Check if we have a direct mapping
  if (CITY_MAPPINGS[cleanCity]) {
    console.log(`🌤️ Mapping "${cleanCity}" → "${CITY_MAPPINGS[cleanCity]}"`);
    mappedCityCache.set(city, CITY_MAPPINGS[cleanCity]);
    return CITY_MAPPINGS[cleanCity];
  }
  
  mappedCityCache.set(city, cleanCity);
  return cleanCity;
};

// Helper to get from cache
const getFromCache = (key) => {
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper to set cache
const setCache = (key, data) => {
  weatherCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Helper to clear cache for a specific city
const clearCacheForCity = (city) => {
  const keys = [...weatherCache.keys()];
  keys.forEach(key => {
    if (key.includes(city)) {
      weatherCache.delete(key);
    }
  });
  // Also clear from mapping cache
  mappedCityCache.delete(city);
};

// Development mode flag - set to false in production
const DEBUG = process.env.NODE_ENV === 'development' ? false : false; // Set to false to disable logs

export const useWeather = (city, options = {}) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Use refs to track if component is mounted and prevent unnecessary updates
  const isMounted = useRef(true);
  const cityRef = useRef(city);
  const hasFetchedRef = useRef(false);
  const fetchTimeoutRef = useRef(null);

  const { 
    enabled = true, 
    days = 5, 
    autoRefresh = false, 
    refreshInterval = 30 * 60 * 1000,
    onSuccess,
    onError 
  } = options;

  // Update refs when values change
  useEffect(() => {
    cityRef.current = city;
  }, [city]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const fetchWeatherData = useCallback(async () => {
    const currentCity = cityRef.current;
    const currentEnabled = enabled;
    
    if (!currentCity || !currentEnabled) {
      if (isMounted.current) {
        setCurrentWeather(null);
        setForecast(null);
        setError(null);
      }
      return;
    }

    const validCity = getValidCityName(currentCity);
    
    if (!validCity) {
      const errorMsg = `Invalid city name: ${currentCity}`;
      if (isMounted.current) {
        setError(errorMsg);
      }
      if (onError) onError(errorMsg);
      return;
    }

    // Prevent multiple simultaneous requests
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    if (isMounted.current) {
      setLoading(true);
      setError(null);
    }

    try {
      // Check cache first
      const cacheKey = `${validCity}_${days}`;
      const cachedData = getFromCache(cacheKey);
      
      if (cachedData && isMounted.current) {
        if (DEBUG) console.log(`🌤️ Using cached weather for "${validCity}"`);
        setCurrentWeather(cachedData.current);
        setForecast(cachedData.forecast);
        setLastUpdated(new Date(cachedData.timestamp));
        setLoading(false);
        hasFetchedRef.current = false;
        
        if (onSuccess) onSuccess(cachedData.current);
        return;
      }

      if (DEBUG) console.log(`🌤️ Fetching weather for "${validCity}" (original: "${currentCity}")`);

      // Fetch current weather with retry logic
      const currentResponse = await weatherAPI.getCurrentWeather(validCity);

      // Fetch forecast
      let forecastData = null;
      try {
        const forecastResponse = await weatherAPI.getForecast(validCity, days);
        forecastData = forecastResponse.data;
      } catch (err) {
        if (DEBUG) console.warn(`🌤️ Forecast unavailable for "${validCity}":`, err.message);
      }

      const weatherData = {
        current: currentResponse.data,
        forecast: forecastData
      };

      // Cache the result
      setCache(cacheKey, weatherData);

      if (isMounted.current) {
        setCurrentWeather(currentResponse.data);
        setForecast(forecastData);
        setLastUpdated(new Date());
        setRetryCount(0);
        setLoading(false);
      }
      
      if (onSuccess) onSuccess(currentResponse.data);

    } catch (err) {
      if (DEBUG) console.error(`🌤️ Error fetching weather for "${currentCity}":`, err.message);
      
      let errorMessage = `Weather unavailable for ${currentCity}`;
      if (err.message?.includes('not found')) {
        errorMessage = `Weather data not found for "${currentCity}". Please check the city name.`;
      } else if (err.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.message?.includes('429')) {
        errorMessage = 'Too many weather requests. Please try again later.';
      } else if (err.message?.includes('401')) {
        errorMessage = 'Weather service authentication failed.';
      }
      
      if (isMounted.current) {
        setError(errorMessage);
        setLoading(false);
      }
      
      if (onError) onError(errorMessage);
      
      // Implement retry logic (max 3 retries, exponential backoff)
      if (retryCount < 3 && !err.message?.includes('not found') && !err.message?.includes('401')) {
        const timeout = 2000 * Math.pow(2, retryCount);
        
        fetchTimeoutRef.current = setTimeout(() => {
          if (isMounted.current) {
            setRetryCount(prev => prev + 1);
            hasFetchedRef.current = false; // Reset for retry
          }
        }, timeout);
      }
    } finally {
      hasFetchedRef.current = false;
    }
  }, [enabled, days, retryCount, onSuccess, onError]);

  // Initial fetch - only when city or enabled changes
  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      hasFetchedRef.current = false; // Reset for new fetch
      fetchWeatherData();
    }, 300); // Increased delay to prevent rapid successive calls

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [city, enabled, fetchWeatherData]);

  // Auto-refresh logic - only when enabled
  useEffect(() => {
    if (!autoRefresh || !city || !enabled) return;

    const intervalId = setInterval(() => {
      hasFetchedRef.current = false; // Reset for refresh
      fetchWeatherData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, city, enabled, refreshInterval, fetchWeatherData]);

  // Refresh weather data (clear cache and fetch new)
  const refreshWeather = useCallback(() => {
    if (city) {
      const validCity = getValidCityName(city);
      clearCacheForCity(validCity);
      setRetryCount(0);
      hasFetchedRef.current = false; // Reset for refresh
      fetchWeatherData();
    }
  }, [city, fetchWeatherData]);

  // Clear cache for this city
  const clearCache = useCallback(() => {
    if (city) {
      const validCity = getValidCityName(city);
      clearCacheForCity(validCity);
    }
  }, [city]);

  // Get cached data status
  const getCacheStatus = useCallback(() => {
    if (!city) return null;
    const validCity = getValidCityName(city);
    const cacheKey = `${validCity}_${days}`;
    const cached = weatherCache.get(cacheKey);
    
    if (cached) {
      const age = Date.now() - cached.timestamp;
      const expiresIn = Math.max(0, CACHE_DURATION - age);
      return {
        isCached: true,
        age: Math.round(age / 1000),
        expiresIn: Math.round(expiresIn / 1000),
        timestamp: new Date(cached.timestamp)
      };
    }
    
    return { isCached: false };
  }, [city, days]);

  return {
    // Data
    currentWeather,
    forecast,
    
    // Status
    loading,
    error,
    lastUpdated,
    
    // Actions
    refreshWeather,
    clearCache,
    
    // Helpers
    isValidCity: city ? !!getValidCityName(city) : false,
    mappedCity: city ? getValidCityName(city) : null,
    cacheStatus: getCacheStatus(),
    
    // Retry info
    retryCount,
    hasRetriesLeft: retryCount < 3
  };
};

// Export cache management functions for global use
export const weatherCacheManager = {
  clearAll: () => {
    weatherCache.clear();
    mappedCityCache.clear();
    console.log('🗑️ All weather cache cleared');
  },
  clearForCity: (city) => {
    clearCacheForCity(city);
  },
  getCacheSize: () => weatherCache.size,
  getCacheKeys: () => [...weatherCache.keys()],
};