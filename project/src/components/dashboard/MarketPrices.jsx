import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { prices } from '../../services/api';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { indianStates, indianCities } from '../../utils/indianStates';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MarketPrices = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState(user?.state || '');
  const [selectedRegion, setSelectedRegion] = useState(user?.region || '');
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication
  useEffect(() => {
    // Only redirect if we've confirmed there's no auth after the initial check
    if (authChecked && !isAuthenticated) {
      navigate('/login');
    }
    // Mark auth as checked after the first render
    if (!authChecked && (isAuthenticated || localStorage.getItem('token'))) {
      setAuthChecked(true);
    }
  }, [isAuthenticated, navigate, authChecked]);

  useEffect(() => {
    // Set initial state and region from user data
    if (user?.state && user?.region) {
      setSelectedState(user.state);
      setSelectedRegion(user.region);
    }
  }, [user]);

  useEffect(() => {
    // Load prices if we're authenticated or have a token
    if (isAuthenticated || localStorage.getItem('token')) {
      loadPrices();
    }
  }, [selectedState, selectedRegion, isAuthenticated]);

  const loadPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await prices.getAll(selectedState, selectedRegion);
      
      if (response && Array.isArray(response.prices)) {
        setPriceData(response.prices);
      } else {
        console.error('Invalid response format:', response);
        setPriceData([]);
        setError('Invalid data received from server');
      }
    } catch (error) {
      console.error('Error loading prices:', error);
      setError(error.message || 'Failed to load market prices');
      setPriceData([]);
      toast.error('Failed to load market prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIndicator = (trend, change) => {
    if (!trend || !change) return null;
    
    const trendConfig = {
      up: {
        icon: <TrendingUp className="text-green-500 h-5 w-5" />,
        color: 'text-green-600',
        arrow: '↑'
      },
      down: {
        icon: <TrendingDown className="text-red-500 h-5 w-5" />,
        color: 'text-red-600',
        arrow: '↓'
      },
      stable: {
        icon: <TrendingFlat className="text-gray-500 h-5 w-5" />,
        color: 'text-gray-600',
        arrow: '→'
      }
    };

    const config = trendConfig[trend] || trendConfig.stable;
    
    return (
      <div className="flex items-center space-x-1">
        {config.icon}
        <span className={`${config.color} text-xs font-medium`}>
          {config.arrow} {Math.abs(change)}%
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Market Prices</h2>
      </div>

      {/* Location Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State {user?.state && <span className="text-xs text-gray-500">(Default: {user.state})</span>}
          </label>
          <select
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedRegion(''); // Reset region when state changes
            }}
          >
            <option value="">All States</option>
            {indianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Region {user?.region && <span className="text-xs text-gray-500">(Default: {user.region})</span>}
          </label>
          <select
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            disabled={!selectedState}
          >
            <option value="">All Regions</option>
            {selectedState && indianCities[selectedState]?.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CROP/VEGETABLE
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                REGION
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PRICE
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LAST UPDATED
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {priceData.map((price) => (
              <tr key={price._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    {price.image_url && (
                      <div className="flex-shrink-0 h-8 w-8 mr-3">
                        <img
                          src={price.image_url}
                          alt={price.crop_name}
                          className="h-8 w-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/32?text=NA';
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {price.crop_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{price.region}</div>
                  <div className="text-xs text-gray-500">{price.state}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">₹{price.price}/kg</span>
                    {getTrendIndicator(price.trend, price.change)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(price.date_effective).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {priceData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No market prices available for the selected location.
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPrices; 