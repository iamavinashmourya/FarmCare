import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FaTractor, FaLeaf, FaSeedling } from 'react-icons/fa';
import { GiWheat, GiFarmTractor, GiPlantWatering, GiCorn } from 'react-icons/gi';

function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await auth.register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  >
                    <option value="">Select State</option>
                    <option value="maharashtra">Maharashtra</option>
                    <option value="gujarat">Gujarat</option>
                    <option value="karnataka">Karnataka</option>
                    {/* Add more states as needed */}
                  </select>
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                    Region/City
                  </label>
                  <select
                    id="region"
                    name="region"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  >
                    <option value="">Select Region</option>
                    <option value="mumbai">Mumbai</option>
                    <option value="pune">Pune</option>
                    <option value="nagpur">Nagpur</option>
                    {/* Add more regions as needed */}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Register
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