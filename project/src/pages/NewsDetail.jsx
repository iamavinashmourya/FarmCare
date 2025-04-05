import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dailyNews } from '../services/api';
import { toast } from 'react-toastify';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNewsDetail();
  }, [id]);

  const loadNewsDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dailyNews.getById(id);
      if (!response || !response.news) {
        throw new Error('News not found');
      }
      setNews(response.news);
    } catch (error) {
      console.error('Error loading news detail:', error);
      setError(error.message || 'Failed to load news detail');
      toast.error(error.message || 'Failed to load news detail');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
          <Link
            to="/dashboard/news"
            className="mt-4 text-green-600 hover:text-green-700 font-medium inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  if (!news) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link 
          to="/dashboard/news" 
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to News
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {news.category || 'General'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{news.title}</h1>

          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {(news.source || 'FN').charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{news.source || 'FarmCare News'}</p>
              <p className="text-sm text-gray-500">{formatDate(news.created_at)}</p>
            </div>
          </div>

          <div className="mb-8">
            <img
              src={news.image_url || 'https://source.unsplash.com/random/1200x400/?agriculture'}
              alt={news.title}
              className="w-full h-[400px] object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://source.unsplash.com/random/1200x400/?agriculture';
              }}
            />
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed text-lg">
              {news.description}
            </p>
          </div>

          {news.url && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors"
              >
                Read Original Article
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsDetail; 