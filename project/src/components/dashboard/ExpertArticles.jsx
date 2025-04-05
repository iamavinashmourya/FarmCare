import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { expertArticles } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ExpertArticles = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadArticles();
  }, [selectedCategory, isAuthenticated, navigate]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching articles with category:', selectedCategory);
      
      const response = await expertArticles.getAll(selectedCategory);
      console.log('API Response:', response);
      
      // Check if response has the expected format
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      // Handle both possible response formats
      const articlesData = response.articles || response;
      if (!Array.isArray(articlesData)) {
        throw new Error('Articles data is not in the expected format');
      }
      
      setArticles(articlesData);
      
      // Extract unique categories if articles exist
      if (articlesData.length > 0) {
        const uniqueCategories = [...new Set(articlesData.map(article => article.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
      
      setRetryCount(0);
    } catch (error) {
      console.error('Error loading articles:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      setRetryCount(prev => prev + 1);
      
      let errorMessage = 'Failed to load expert articles. Please try again.';
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Please login to view expert articles.';
            navigate('/login');
            break;
          case 403:
            errorMessage = 'You do not have permission to view these articles.';
            break;
          case 404:
            errorMessage = 'Expert articles not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Unable to reach the server. Please check your connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (retryCount < 3) {
        console.log(`Retrying... Attempt ${retryCount + 1}`);
        setTimeout(loadArticles, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReadMore = (articleId) => {
    if (!articleId) {
      console.error('Invalid article ID');
      return;
    }
    navigate(`/dashboard/articles/${articleId}`);
  };

  const handleRetry = () => {
    setRetryCount(0);
    loadArticles();
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Expert Articles</h1>
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

      {articles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No articles found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div 
              key={article._id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
              onClick={() => handleReadMore(article._id)}
            >
              <img
                src={article.image_url || 'https://source.unsplash.com/random/800x600/?farming'}
                alt={article.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://source.unsplash.com/random/800x600/?farming';
                }}
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{article.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {article.author?.split(' ').map(n => n[0]).join('') || 'AA'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{article.author || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{article.created_at || 'Recent'}</p>
                    </div>
                  </div>
                  <span className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center">
                    Read More 
                    <span className="ml-1">→</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpertArticles; 