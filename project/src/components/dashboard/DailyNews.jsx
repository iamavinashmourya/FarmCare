import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { dailyNews } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DailyNews = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching news...');
      const response = await dailyNews.getAll();
      console.log('News response:', response);
      
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      const newsData = response.news || [];
      if (!Array.isArray(newsData)) {
        throw new Error('News data is not in the expected format');
      }
      
      setNews(newsData);
      
      // Extract unique categories
      if (newsData.length > 0) {
        const uniqueCategories = [...new Set(newsData.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
      
    } catch (error) {
      console.error('Error loading news:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to load news. Please try again.';
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Please login to view news.';
            break;
          case 403:
            errorMessage = 'You do not have permission to view news.';
            break;
          case 404:
            errorMessage = 'News not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.error || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Unable to reach the server. Please check your connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleNewsClick = (newsId) => {
    navigate(`/news/${newsId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Daily News</h1>
        <div className="flex items-center space-x-4">
          <select 
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No news available at the moment.
        </div>
      ) : (
        <div className="space-y-6">
          {news.map((item) => (
            <div 
              key={item._id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transform transition-transform duration-200 hover:scale-[1.02]"
              onClick={() => handleNewsClick(item._id)}
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4">
                  <img
                    src={item.image_url || 'https://source.unsplash.com/random/800x600/?agriculture'}
                    alt={item.title}
                    className="w-full h-48 md:h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://source.unsplash.com/random/800x600/?agriculture';
                    }}
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {item.category || 'General'}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Source:</span>
                      <span className="text-sm font-medium text-gray-900">{item.source || 'FarmCare News'}</span>
                      <span className="text-sm text-gray-500 ml-2">{formatTime(item.created_at)}</span>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Read Full Article
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyNews; 