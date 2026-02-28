import axios from "axios";

const WEATHER_API_KEY = "8e7de39ee4545ee77a1b1e610a1242ab"; // Your actual API key
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "http://api.openweathermap.org/geo/1.0";

// Cache weather data to avoid excessive API calls
const weatherCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const weatherAPI = {
  // Get current weather by city name
  getCurrentWeather: async (city) => {
    if (!city) {
      throw new Error("City name is required");
    }

    const cacheKey = `current_${city}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🌤️ Using cached weather data for', city);
      return { data: cached.data };
    }

    try {
      console.log('🌤️ Fetching weather from OpenWeatherMap for', city);
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: WEATHER_API_KEY,
          units: "metric", // Celsius
        },
      });

      console.log('🌤️ OpenWeatherMap response:', response.data);

      // Get air quality data
      let airQuality = null;
      try {
        const aqResponse = await axios.get(`${BASE_URL}/air_pollution`, {
          params: {
            lat: response.data.coord.lat,
            lon: response.data.coord.lon,
            appid: WEATHER_API_KEY,
          },
        });
        if (aqResponse.data.list && aqResponse.data.list[0]) {
          airQuality = {
            aqi: aqResponse.data.list[0].main.aqi,
            components: aqResponse.data.list[0].components
          };
        }
      } catch (aqError) {
        console.log('Air quality data unavailable:', aqError.message);
      }

      const weatherData = {
        // Basic info
        name: response.data.name,
        city: response.data.name,
        country: response.data.sys.country,
        
        // Temperatures
        temperature: Math.round(response.data.main.temp),
        feelsLike: Math.round(response.data.main.feels_like),
        tempMin: Math.round(response.data.main.temp_min),
        tempMax: Math.round(response.data.main.temp_max),
        
        // Other metrics
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        visibility: response.data.visibility,
        
        // Wind
        windSpeed: response.data.wind.speed,
        windDeg: response.data.wind.deg,
        windGust: response.data.wind.gust,
        
        // Weather description
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        iconUrl: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`,
        
        // Sun times
        sunrise: response.data.sys.sunrise,
        sunset: response.data.sys.sunset,
        
        // Coordinates
        lat: response.data.coord.lat,
        lon: response.data.coord.lon,
        
        // Timestamps
        timestamp: response.data.dt,
        timezone: response.data.timezone,
        
        // Air quality
        airQuality,
        
        // Raw data for backward compatibility
        main: {
          temp: response.data.main.temp,
          feels_like: response.data.main.feels_like,
          humidity: response.data.main.humidity,
          pressure: response.data.main.pressure,
          temp_min: response.data.main.temp_min,
          temp_max: response.data.main.temp_max,
        },
        wind: {
          speed: response.data.wind.speed,
          deg: response.data.wind.deg,
          gust: response.data.wind.gust,
        },
        weather: response.data.weather,
        sys: response.data.sys,
        coord: response.data.coord,
      };

      weatherCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now(),
      });

      return { data: weatherData };
      
    } catch (error) {
      console.error('❌ OpenWeatherMap API error:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        throw new Error(`City "${city}" not found`);
      }
      if (error.response?.status === 401) {
        throw new Error("Invalid API key");
      }
      throw new Error("Failed to fetch weather data");
    }
  },

  // Get 5-day forecast by city name
  getForecast: async (city, days = 5) => {
    if (!city) {
      throw new Error("City name is required");
    }

    const cacheKey = `forecast_${city}_${days}`;
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return { data: cached.data };
    }

    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: WEATHER_API_KEY,
          units: "metric",
        },
      });

      // Group by day and get midday forecast
      const dailyForecast = [];
      const seenDates = new Set();

      response.data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const hour = date.getHours();

        if (!seenDates.has(dateStr) && hour >= 11 && hour <= 14) {
          seenDates.add(dateStr);
          dailyForecast.push({
            date: date,
            dateStr,
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            temperature: Math.round(item.main.temp),
            feelsLike: Math.round(item.main.feels_like),
            tempMin: Math.round(item.main.temp_min),
            tempMax: Math.round(item.main.temp_max),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
            humidity: item.main.humidity,
            pressure: item.main.pressure,
            windSpeed: item.wind.speed,
            windDeg: item.wind.deg,
            pop: item.pop, // Probability of precipitation
          });
        }
      });

      const forecastData = dailyForecast.slice(0, days);
      
      weatherCache.set(cacheKey, {
        data: forecastData,
        timestamp: Date.now(),
      });

      return { data: forecastData };
      
    } catch (error) {
      console.error('❌ Forecast API error:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        throw new Error("City not found");
      }
      throw new Error("Failed to fetch forecast");
    }
  },

  // Search for cities
  searchCities: async (query) => {
    if (!query) return [];
    
    try {
      const response = await axios.get(`${GEO_URL}/direct`, {
        params: {
          q: query,
          limit: 5,
          appid: WEATHER_API_KEY,
        },
      });
      
      const cities = response.data.map(city => ({
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon,
        display: `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`
      }));
      
      return { data: cities };
    } catch (error) {
      console.error('City search error:', error);
      return { data: [] };
    }
  },

  // Get weather by coordinates
  getWeatherByCoords: async (lat, lon) => {
    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: "metric",
        },
      });
      
      return { data: response.data };
    } catch (error) {
      console.error('Weather by coordinates error:', error);
      throw error;
    }
  },

  // Clear cache for a specific city
  clearCache: (city) => {
    const keys = [...weatherCache.keys()];
    keys.forEach(key => {
      if (key.includes(city)) {
        weatherCache.delete(key);
      }
    });
  },

  // Clear all cache
  clearAllCache: () => {
    weatherCache.clear();
  },
};

export default weatherAPI;