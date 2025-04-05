import React from 'react';
import Weather from '../components/Weather';
import { useAuth } from '../context/AuthContext';

const Articles = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Weather Section */}
      {isAuthenticated ? (
        <div className="mb-12">
          <Weather />
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-12">
          <p className="text-yellow-700">
            Please log in to view detailed weather information for your location.
          </p>
        </div>
      )}

      {/* Articles Section */}
      <h1 className="text-3xl font-bold mb-6">Agricultural Articles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Article cards will be mapped here */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img 
            src="/placeholder-article.jpg" 
            alt="Article thumbnail"
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Sustainable Farming Practices</h2>
            <p className="text-gray-600 mb-4">
              Learn about the latest sustainable farming practices that can help improve your yield while protecting the environment.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">5 min read</span>
              <button className="text-green-600 hover:text-green-700">Read More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Articles; 