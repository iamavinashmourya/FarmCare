import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FaTractor, FaLeaf, FaSeedling } from 'react-icons/fa';
import { GiWheat, GiFarmTractor, GiPlantWatering } from 'react-icons/gi';

function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    isAdmin: false,
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await (formData.isAdmin ? auth.adminLogin : auth.login)(
        formData.loginId,
        formData.password
      );
      
      // Call the login function from AuthContext with both token and user data
      login(response.token, response.user);
      
      toast.success('Login successful!');
      
      // Redirect after a short delay to ensure state is updated
      setTimeout(() => {
        navigate(formData.isAdmin ? '/admin' : '/dashboard');
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
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
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Login to FarmCare</h2>
              <p className="text-sm text-gray-600">Welcome back! Please enter your details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">
                  Mobile or Email
          </label>
          <input
                  id="loginId"
                  name="loginId"
            type="text"
                  required
            value={formData.loginId}
            onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  placeholder="Enter your mobile or email"
          />
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
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
            <input
                    id="isAdmin"
                    name="isAdmin"
              type="checkbox"
              checked={formData.isAdmin}
              onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
                  <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-700">
                    Login as Admin
          </label>
        </div>
                <Link to="/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-500">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
          Login
        </button>
      </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                  Create new account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;