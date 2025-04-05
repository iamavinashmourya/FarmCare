import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          setError('Please enable location access for weather information');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }
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
            Authorization: `Bearer ${token}`
          }
        });

        setWeatherData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch weather data');
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Agricultural Weather Report</h2>
      
      {/* Current Weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Current Conditions</h3>
          <div className="space-y-2">
            <p>Temperature: {weatherData.current.temperature}°C</p>
            <p>Humidity: {weatherData.current.humidity}%</p>
            <p>Wind Speed: {weatherData.current.wind_speed} m/s</p>
            <p>Soil Temperature: {weatherData.current.soil_temp}°C</p>
            <p>Rainfall (last hour): {weatherData.current.rainfall} mm</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Agricultural Metrics</h3>
          <div className="space-y-2">
            <p>Growing Degree Days: {weatherData.agricultural_metrics.growing_degree_days.toFixed(1)}</p>
            <p>Evapotranspiration: {weatherData.agricultural_metrics.evapotranspiration} mm/day</p>
            <p>Frost Risk: {weatherData.agricultural_metrics.frost_risk}</p>
            <p>Irrigation Need: {weatherData.agricultural_metrics.ideal_irrigation}</p>
          </div>
        </div>
      </div>

      {/* Farming Advice */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Farming Advice</h3>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-gray-700 mb-3">{weatherData.farming_advice.risk_indicator}</div>
          <div className="text-gray-700 mb-3">{weatherData.farming_advice.weather_summary}</div>
          <ul className="list-disc list-inside space-y-2">
            {weatherData.farming_advice.recommendations.map((advice, index) => (
              <li key={index} className="text-gray-700">{advice}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Forecast */}
      <div>
        <h3 className="text-xl font-semibold mb-4">24-Hour Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {weatherData.forecast.map((item, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{new Date(item.date).toLocaleTimeString()}</p>
              <p>{item.temperature}°C</p>
              <p>{item.humidity}% Humidity</p>
              <p>{item.rainfall_chance}% Rain Chance</p>
              <p className="capitalize">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Weather; 