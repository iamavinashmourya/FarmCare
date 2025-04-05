import React, { useState, useEffect } from 'react';
import { FaSun, FaCloudRain, FaSeedling, FaLeaf } from 'react-icons/fa';
import SchemeCarousel from './SchemeCarousel';
import { schemes as schemesApi, weather as weatherApi } from '../../services/api';
import { Link } from 'react-router-dom';

const Overview = () => {
  const [schemes, setSchemes] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching dashboard data...'); // Debug log
      
      // Get user's location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            // Fetch weather data
            const weatherResponse = await weatherApi.getWeather(
              position.coords.latitude,
              position.coords.longitude
            );
            console.log('Weather data:', weatherResponse); // Debug log
            setWeatherData(weatherResponse);
          } catch (err) {
            console.error('Error fetching weather:', err);
            setError('Failed to load weather data. Please try again later.');
          }
        }, (err) => {
          console.error('Geolocation error:', err);
          setError('Please enable location access to get weather information.');
        });
      } else {
        setError('Geolocation is not supported by your browser.');
      }

      // Fetch schemes using the API service
      const schemesData = await schemesApi.getSchemes();
      console.log('Schemes data:', schemesData); // Debug log
      setSchemes(schemesData?.schemes || []);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine crop health status
  const getCropHealthStatus = (weatherData) => {
    if (!weatherData?.farming_advice?.risk_level) return { status: 'Loading...', description: 'Loading conditions...' };

    const riskLevel = weatherData.farming_advice.risk_level;
    const conditions = weatherData.current?.description || '';
    const humidity = weatherData.current?.humidity || 0;
    const windSpeed = weatherData.current?.wind_speed || 0;

    let status, description;
    switch (riskLevel) {
      case 'low':
        status = 'Good';
        description = 'Optimal growing conditions';
        break;
      case 'moderate':
        status = 'Fair';
        description = 'Moderate risk conditions';
        break;
      case 'high':
        status = 'Attention';
        description = `${conditions}, ${humidity}% Humidity, Wind ${windSpeed}m/s`;
        break;
      default:
        status = 'Loading...';
        description = 'Loading conditions...';
    }
    return { status, description };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const cropHealth = getCropHealthStatus(weatherData);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <p className="text-yellow-700">{error}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center mb-2">
            <FaSun className="text-yellow-500 text-2xl mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Weather</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {weatherData?.current?.temperature ? `${Math.round(weatherData.current.temperature)}°C` : '--°C'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center mb-2">
            <FaSeedling className="text-green-500 text-2xl mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Crop Health</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{cropHealth.status}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center mb-2">
            <FaCloudRain className="text-purple-500 text-2xl mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Rainfall</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {weatherData?.current?.rainfall !== undefined ? `${weatherData.current.rainfall}mm` : '0mm'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center mb-2">
            <FaLeaf className="text-orange-500 text-2xl mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Active Schemes</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">{schemes.length}</p>
          <p className="text-gray-600">Available schemes</p>
        </div>
      </div>

      {/* Schemes Carousel */}
      <div className="w-full overflow-hidden mb-8">
        <SchemeCarousel schemes={schemes} />
      </div>
    </div>
  );
};

export default Overview; 