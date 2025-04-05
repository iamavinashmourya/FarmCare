import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Weather() {
  const { token } = useAuth();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setLocation(coords);
          
          // Get location name using reverse geocoding
          try {
            const response = await axios.get(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${coords.lat}&lon=${coords.lon}&limit=1&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
            );
            if (response.data && response.data[0]) {
              const place = response.data[0];
              setLocationName(`${place.name}, ${place.state || ''}`);
            }
          } catch (err) {
            console.error('Error fetching location name:', err);
          }
        },
        (error) => {
          setError('Unable to retrieve your location. Please enable location services.');
          setLoading(false);
        }
      );
    };

    getLocation();
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) return;

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/weather`, {
          params: {
            lat: location.lat,
            lon: location.lon
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setWeather(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(err.response?.data?.error || 'Failed to fetch weather data. Please try again later.');
        setLoading(false);
      }
    };

    if (location && token) {
      fetchWeatherData();
    }
  }, [location, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mx-4">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="h-full px-4 py-4">
      {/* Location Header */}
      <div className="flex items-center space-x-2 text-gray-600 mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm font-medium">{locationName || 'Your Location'}</span>
      </div>

      {/* Current Weather */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-col">
          <div className="text-4xl font-bold text-gray-800">{Math.round(weather.current.temperature)}°C</div>
          <div className="text-sm text-gray-600 capitalize">{weather.current.description}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="bg-blue-50 rounded p-2">
            <div className="text-blue-600">Humidity</div>
            <div className="font-semibold">{weather.current.humidity}%</div>
          </div>
          <div className="bg-green-50 rounded p-2">
            <div className="text-green-600">Wind Speed</div>
            <div className="font-semibold">{weather.current.wind_speed} m/s</div>
          </div>
          <div className="bg-yellow-50 rounded p-2">
            <div className="text-yellow-600">Soil Temp</div>
            <div className="font-semibold">{weather.current.soil_temp}°C</div>
          </div>
          <div className="bg-purple-50 rounded p-2">
            <div className="text-purple-600">Rainfall</div>
            <div className="font-semibold">{weather.current.rainfall} mm</div>
          </div>
        </div>
      </div>

      {/* Agricultural Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Agricultural Metrics</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-emerald-600">Growing Degree Days</span>
            <span className="font-semibold">{weather.agricultural_metrics.growing_degree_days.toFixed(1)}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-600">Evapotranspiration</span>
            <span className="font-semibold">{weather.agricultural_metrics.evapotranspiration} mm/day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-600">Frost Risk</span>
            <span className="font-semibold">{weather.agricultural_metrics.frost_risk}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-600">Irrigation Need</span>
            <span className="font-semibold">{weather.agricultural_metrics.ideal_irrigation}</span>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">24-Hour Forecast</h3>
        <div className="space-y-3">
          {weather.forecast.slice(0, 4).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
              <div>
                <div className="font-medium">{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-gray-500 text-xs capitalize">{item.description}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{Math.round(item.temperature)}°C</div>
                <div className="text-xs text-gray-500">{Math.round(item.rainfall_chance)}% rain</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Farming Advice */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Farming Advice</h3>
        <div className="text-sm text-gray-600 mb-3">{weather.farming_advice.risk_indicator}</div>
        <div className="text-sm text-gray-600 mb-3">{weather.farming_advice.weather_summary}</div>
        <ul className="space-y-2">
          {weather.farming_advice.recommendations.map((advice, index) => (
            <li key={index} className="flex items-start space-x-2 text-sm">
              <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">{advice}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Weather; 