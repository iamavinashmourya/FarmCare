import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FaTractor, FaLeaf, FaSeedling } from 'react-icons/fa';
import { GiWheat, GiFarmTractor, GiPlantWatering, GiCorn } from 'react-icons/gi';
import { indianStates, indianCities } from '../utils/indianStates';

function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    state: '',
    region: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    // Validate full name (at least two words)
    const nameWords = formData.fullName.trim().split(/\s+/);
    if (nameWords.length < 2) {
      toast.error('Please enter your full name (first name and last name)');
      return false;
    }

    // Validate mobile number (exactly 10 digits)
    if (!/^\d{10}$/.test(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Validate password (minimum 8 characters)
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }

    // Validate state and region selection
    if (!formData.state) {
      toast.error('Please select a state');
      return false;
    }

    if (!formData.region) {
      toast.error('Please select a city');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await auth.register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Get available regions based on selected state
  const availableRegions = formData.state ? indianCities[formData.state] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23065f46' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Background Vector Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 text-green-700 opacity-15 transform rotate-12">
          <FaTractor size={100} />
        </div>
        <div className="absolute top-1/4 right-20 text-green-700 opacity-15 transform -rotate-12">
          <GiWheat size={80} />
        </div>
        <div className="absolute bottom-20 left-20 text-green-700 opacity-15">
          <FaLeaf size={60} />
        </div>
        <div className="absolute top-1/3 left-1/4 text-green-700 opacity-15">
          <FaSeedling size={70} />
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-green-700 opacity-15">
          <GiFarmTractor size={90} />
        </div>
        <div className="absolute bottom-40 right-20 text-green-700 opacity-15 transform rotate-45">
          <GiPlantWatering size={70} />
        </div>
        <div className="absolute top-40 right-1/3 text-green-700 opacity-15 transform -rotate-45">
          <GiCorn size={70} />
        </div>
      </div>

      {/* Register Form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Register for FarmCare</h2>
              <p className="text-sm text-gray-600">Create your account to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <div className="mt-1 flex">
                  <div className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm min-w-[80px]">
                    <div className="flex items-center gap-1">
                      <span>IN</span>
                      <span>+91</span>
                    </div>
                  </div>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, mobile: value });
                    }}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    placeholder="Enter 10 digit number"
                    maxLength="10"
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    placeholder="Create a password"
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <select
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        state: e.target.value,
                        region: '' // Reset region when state changes
                      });
                    }}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  >
                    <option value="">Select State</option>
                    {indianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <select
                    id="region"
                    name="region"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={!formData.state}
                  >
                    <option value="">Select City</option>
                    {availableRegions.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  loading 
                    ? 'bg-green-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                } transition-colors`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                  Login to your account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;