import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { expertArticles } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ArticleDetail = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadArticle();
  }, [articleId, isAuthenticated, navigate]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching article:', articleId);
      const response = await expertArticles.getById(articleId);
      console.log('Article response:', response);
      
      // Check if response has the expected format
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      // Handle the response format where article data is nested under 'article' key
      const articleData = response.article || response;
      if (!articleData || typeof articleData !== 'object') {
        throw new Error('Article data is not in the expected format');
      }
      
      setArticle(articleData);
    } catch (error) {
      console.error('Error loading article:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to load article. Please try again.';
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Please login to view this article.';
            navigate('/login');
            break;
          case 403:
            errorMessage = 'You do not have permission to view this article.';
            break;
          case 404:
            errorMessage = 'Article not found.';
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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      );
    }

    if (!article) {
      return (
        <div className="p-4">
          <div className="text-center text-gray-500">
            Article not found
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <div className="mb-6">
          <div className="mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {article.category || 'Uncategorized'}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {article.author?.split(' ').map(n => n[0]).join('') || 'A'}
                </span>
              </div>
              <span className="font-medium">{article.author || 'Anonymous'}</span>
            </div>
            <span>•</span>
            <span>{article.created_at || 'Recent'}</span>
          </div>
        </div>

        {/* Article Image */}
        <div className="mb-8">
          <img
            src={article.image_url || 'https://source.unsplash.com/random/1200x600/?farming'}
            alt={article.title}
            className="w-full h-[400px] object-cover rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://source.unsplash.com/random/1200x600/?farming';
            }}
          />
        </div>

        {/* Article Content */}
        <div className="prose max-w-none">
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            {article.description}
          </p>
          {article.content && (
            <div className="text-gray-700 leading-relaxed">
              {article.content}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center">
            <button
              onClick={() => navigate('/dashboard/articles')}
              className="text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              <span className="mr-2">←</span>
              Back to Articles
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default ArticleDetail; 