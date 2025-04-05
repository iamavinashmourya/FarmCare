import axios from 'axios';

// Use a constant for the API base URL
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://farmcare-ze9p.onrender.com'
  : 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token and handle errors
api.interceptors.request.use(
  (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (loginId, password) => {
    const response = await api.post('/user/login', { login_id: loginId, password });
    return response.data;
  },
  register: async (userData) => {
    // Format the data to match backend expectations
    const formattedData = {
      full_name: userData.fullName,
      email: userData.email,
      mobile: userData.mobile,
      password: userData.password,
      state: userData.state,
      region: userData.region
    };
    
    try {
      const response = await api.post('/user/register', formattedData);
    return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Registration failed. Please try again.');
    }
  },
  adminLogin: async (loginId, password) => {
    const response = await api.post('/admin/login', { login_id: loginId, password });
    return response.data;
  },
  adminRegister: async (userData) => {
    const response = await api.post('/admin/register', userData);
    return response.data;
  },
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/user/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      // Still remove local storage items even if server request fails
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      throw error;
    }
  },
  updateProfile: async (data) => {
    try {
      const response = await api.put('/user/profile', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error.message);
      throw error;
    }
  },
  updateProfileImage: async (formData) => {
    try {
      const response = await api.post('/user/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Profile image update error:', error.response?.data || error.message);
      throw error;
    }
  },
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export const diseaseDetection = {
  uploadImage: async (file) => {
    try {
    const formData = new FormData();
    formData.append('file', file);
      
    const response = await api.post('/user/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
        timeout: 30000, // 30 second timeout
    });

      if (!response.data) {
        throw new Error('No response from server');
      }

    return response.data;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      if (error.response) {
        throw new Error(error.response.data.error || 'Server error');
      } else if (error.request) {
        throw new Error('No response from server. Please check your internet connection.');
      } else {
        throw new Error('Error uploading image. Please try again.');
      }
    }
  },
};

export const marketPrices = {
  getPrices: async (state, region) => {
    const response = await api.get('/prices', { params: { state, region } });
    return response.data;
  },
  addPrice: async (priceData) => {
    const formData = new FormData();
    Object.keys(priceData).forEach(key => {
      if (key === 'image' && priceData[key]) {
        formData.append('image', priceData[key]);
      } else if (priceData[key] !== null) {
        formData.append(key, priceData[key]);
      }
    });
    const response = await api.post('/admin/prices', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  updatePrice: async (priceId, priceData) => {
    const formData = new FormData();
    Object.keys(priceData).forEach(key => {
      if (key === 'image' && priceData[key]) {
        formData.append('image', priceData[key]);
      } else if (priceData[key] !== null) {
        formData.append(key, priceData[key]);
      }
    });
    const response = await api.put(`/admin/prices/${priceId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deletePrice: async (priceId) => {
    const response = await api.delete(`/admin/prices/${priceId}`);
    return response.data;
  },
};

export const schemes = {
  getSchemes: async (state) => {
    const response = await api.get('/schemes', { params: { state } });
    return response.data;
  },
  addScheme: async (schemeData) => {
    const response = await api.post('/admin/schemes', schemeData);
    return response.data;
  },
  updateScheme: async (schemeId, schemeData) => {
    const response = await api.put(`/admin/schemes/${schemeId}`, schemeData);
    return response.data;
  },
  deleteScheme: async (schemeId) => {
    const response = await api.delete(`/admin/schemes/${schemeId}`);
    return response.data;
  },
};

export const getMarketPrices = async (lat, lng) => {
  try {
    const response = await api.get('/market-prices', {
      params: { lat, lng },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market prices:', error);
    return [];
  }
};

export const getAiInsights = async () => {
  try {
    const response = await api.get('/ai-insights');
    return response.data;
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return [];
  }
};

export const getSchemes = async () => {
  try {
    const response = await api.get('/schemes');
    return response.data;
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return [];
  }
};

export const detectPlantDisease = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await api.post('/user/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error in detectPlantDisease:', error);
    if (error.response?.status === 401) {
      throw new Error('Please login to use this feature');
    }
    throw error;
  }
};

// Market Prices API
const prices = {
  getAll: async (state = null, region = null) => {
    try {
      const params = new URLSearchParams();
      if (state) params.append('state', state);
      if (region) params.append('region', region);
      const response = await api.get(`/api/prices?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getByLocation: async (latitude, longitude) => {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString()
      });
      const response = await api.get(`/api/market-prices?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (priceData) => {
    try {
      const response = await api.post('/api/prices', priceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, priceData) => {
    try {
      const response = await api.put(`/api/prices/${id}`, priceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/api/prices/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const expertArticles = {
  getAll: async (category = null) => {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.append('category', category);
      }
      const response = await api.get(`/expert-articles${params.toString() ? `?${params.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expert articles:', error);
      throw error;
    }
  },

  getById: async (articleId) => {
    try {
      const response = await api.get(`/expert-articles/${articleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  },

  create: async (articleData) => {
    try {
      const formData = new FormData();
      Object.keys(articleData).forEach(key => {
        if (key === 'image' && articleData[key]) {
          formData.append('image', articleData[key]);
        } else {
          formData.append(key, articleData[key].toString());
        }
      });
      const response = await api.post('/admin/expert-articles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  },

  update: async (articleId, articleData) => {
    try {
      const formData = new FormData();
      Object.keys(articleData).forEach(key => {
        if (key === 'image' && articleData[key]) {
          formData.append('image', articleData[key]);
        } else if (articleData[key] !== null) {
          formData.append(key, articleData[key].toString());
        }
      });
      const response = await api.put(`/admin/expert-articles/${articleId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  },

  delete: async (articleId) => {
    try {
      const response = await api.delete(`/admin/expert-articles/${articleId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }
};

export const dailyNews = {
  getAll: async () => {
    try {
      const response = await api.get('/daily-news');
      return response.data;
    } catch (error) {
      console.error('Error fetching daily news:', error);
      throw error;
    }
  },

  getById: async (newsId) => {
    try {
      const response = await api.get(`/daily-news/${newsId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching news item:', error);
      throw error;
    }
  },

  create: async (newsData) => {
    try {
      const formData = new FormData();
      Object.keys(newsData).forEach(key => {
        if (key === 'image' && newsData[key]) {
          formData.append('image', newsData[key]);
        } else {
          formData.append(key, newsData[key].toString());
        }
      });
      const response = await api.post('/admin/daily-news', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  },

  update: async (newsId, newsData) => {
    try {
      const formData = new FormData();
      Object.keys(newsData).forEach(key => {
        if (key === 'image' && newsData[key]) {
          formData.append('image', newsData[key]);
        } else if (newsData[key] !== null) {
          formData.append(key, newsData[key].toString());
        }
      });
      const response = await api.put(`/admin/daily-news/${newsId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  },

  delete: async (newsId) => {
    try {
      const response = await api.delete(`/admin/daily-news/${newsId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }
};

export const getAnalysisCount = async () => {
  try {
    const response = await api.get('/user/analysis/count');
    console.log('Analysis count response:', response.data); // Debug log
    return response.data.count || 0;
  } catch (error) {
    console.error('Error fetching analysis count:', error.response?.data || error.message);
    return 0;
  }
};

export const weather = {
  getWeather: async (lat, lon) => {
    try {
      const response = await api.get('/weather', {
        params: { lat, lon },
        timeout: 10000 // 10 second timeout
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(error.response.data.error || 'Failed to fetch weather data');
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from weather service. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error fetching weather data: ' + error.message);
      }
    }
  }
};

export { api as default, prices };