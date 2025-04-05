import React, { useState, useEffect } from 'react';
import { schemes } from '../services/api';
import { toast } from 'react-toastify';
import { FaSearch, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

function Schemes() {
  const [schemesList, setSchemesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    fetchSchemes();
  }, [selectedState]);

  const fetchSchemes = async () => {
    try {
      const response = await schemes.getSchemes(selectedState);
      setSchemesList(response.schemes);
    } catch (error) {
      toast.error('Failed to fetch schemes');
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-32">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Government Agricultural Schemes</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore and apply for various agricultural schemes provided by the government to support farmers
          </p>
        </motion.div>
        
        <div className="max-w-md mx-auto">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm transition-all duration-200 text-gray-700"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              placeholder="Search by state name..."
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-500"></div>
          </div>
        ) : schemesList.length > 0 ? (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 auto-rows-fr"
          >
            {schemesList.map((scheme) => (
              <motion.div
                key={scheme._id}
                variants={item}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col group"
              >
                <div className="p-8 flex-grow">
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {scheme.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full shrink-0 ml-4">
                      <FaMapMarkerAlt className="h-4 w-4 text-green-500" />
                      <span>{scheme.state}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-8 line-clamp-3">{scheme.description}</p>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                      <h4 className="font-semibold text-gray-900 mb-3">Eligibility Criteria</h4>
                      <p className="text-gray-600 line-clamp-4">{scheme.eligibility}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                      <h4 className="font-semibold text-gray-900 mb-3">Benefits</h4>
                      <p className="text-gray-600 line-clamp-4">{scheme.benefits}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 mt-auto">
                  <button className="w-full bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center group">
                    <span>Apply Now</span>
                    <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-200" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <p className="text-gray-600 text-lg">No schemes found for the selected state</p>
            <p className="text-gray-500 mt-2">Try searching for a different state</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Schemes;