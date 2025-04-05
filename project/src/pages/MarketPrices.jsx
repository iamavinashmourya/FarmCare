import React, { useState, useEffect } from 'react';
import { marketPrices } from '../services/api';
import { toast } from 'react-toastify';

function MarketPrices() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    state: '',
    region: '',
  });

  useEffect(() => {
    fetchPrices();
  }, [filters]);

  const fetchPrices = async () => {
    try {
      const response = await marketPrices.getPrices(filters.state, filters.region);
      setPrices(response.prices);
    } catch (error) {
      toast.error('Failed to fetch market prices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Market Prices</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2">State</label>
            <input
              type="text"
              className="input-field"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              placeholder="Enter state"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Region</label>
            <input
              type="text"
              className="input-field"
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              placeholder="Enter region"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : prices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-gray-700">Crop</th>
                  <th className="px-6 py-3 text-left text-gray-700">Price</th>
                  <th className="px-6 py-3 text-left text-gray-700">State</th>
                  <th className="px-6 py-3 text-left text-gray-700">Region</th>
                  <th className="px-6 py-3 text-left text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => (
                  <tr key={price._id} className="border-b">
                    <td className="px-6 py-4">{price.crop_name}</td>
                    <td className="px-6 py-4">₹{price.price}</td>
                    <td className="px-6 py-4">{price.state}</td>
                    <td className="px-6 py-4">{price.region}</td>
                    <td className="px-6 py-4">
                      {new Date(price.date_effective).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No prices found for the selected filters
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketPrices;