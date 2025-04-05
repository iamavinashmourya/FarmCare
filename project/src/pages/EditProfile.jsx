import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { auth } from '../services/api';
import { FaCamera, FaEye, FaEyeSlash, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    current_password: '',
    new_password: ''
  });

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasNumber: false,
    hasUpper: false,
    hasLower: false,
    hasSpecial: false
  });

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const response = await auth.getProfile();
        if (response?.user) {
          setFormData(prev => ({
            ...prev,
            full_name: response.user.full_name || prev.full_name,
            email: response.user.email || prev.email
          }));
          updateUserProfile(response.user);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        if (error.response?.status === 401) {
          // Token expired or invalid
          navigate('/login');
        } else {
          toast.error('Failed to load profile data');
        }
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    if (initialLoad) {
      loadUserData();
    }
  }, [updateUserProfile, navigate, initialLoad]);

  const validatePassword = (password) => {
    if (!password) {
      setPasswordStrength({
        length: false,
        hasNumber: false,
        hasUpper: false,
        hasLower: false,
        hasSpecial: false
      });
      return false;
    }

    const strength = {
      length: password.length >= 6,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordStrength(strength);
    return Object.values(strength).every(Boolean);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, new_password: newPassword });
    validatePassword(newPassword);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await auth.updateProfileImage(formData);
      if (response?.profile_image) {
        updateUserProfile({ profile_image: response.profile_image });
        toast.success('Profile image updated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error(error.response?.data?.error || 'Failed to update profile image');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if password is being changed
    if (formData.new_password && !formData.current_password) {
      toast.error('Please enter your current password');
      return;
    }

    if (formData.new_password && !validatePassword(formData.new_password)) {
      toast.error('New password does not meet requirements');
      return;
    }

    // Prepare update data
    const updateData = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim()
    };

    // Only include password fields if changing password
    if (formData.new_password) {
      updateData.current_password = formData.current_password;
      updateData.new_password = formData.new_password;
    }

    try {
      setLoading(true);
      const response = await auth.updateProfile(updateData);
      
      if (response?.user) {
        updateUserProfile(response.user);
        toast.success('Profile updated successfully');
        
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          full_name: response.user.full_name || prev.full_name,
          email: response.user.email || prev.email
        }));
        
        // Reset password strength indicators
        setPasswordStrength({
          length: false,
          hasNumber: false,
          hasUpper: false,
          hasLower: false,
          hasSpecial: false
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error(error.response?.data?.error || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-8">Edit Profile</h2>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 cursor-pointer group"
                onClick={handleImageClick}
              >
                {user?.profile_image ? (
                  <img
                    src={user.profile_image.url}
                    alt={user.full_name}
                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <FaCamera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-25 flex items-center justify-center transition-all">
                  <FaCamera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <span className="flex items-center gap-1 pl-3 pr-2 border-r border-gray-300 h-full">
                    <span className="text-gray-500 text-sm font-medium">IN</span>
                    <span className="text-gray-500 text-sm font-medium">+91</span>
                  </span>
                </div>
                <input
                  type="text"
                  id="mobile"
                  value={user?.mobile || ''}
                  className="mt-1 block w-full pl-[4.5rem] pr-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500"
                  disabled
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">Mobile number cannot be updated</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="current_password"
                      value={formData.current_password}
                      onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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

                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="new_password"
                      value={formData.new_password}
                      onChange={handlePasswordChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <FaEyeSlash className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FaEye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formData.new_password && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
                      <ul className="text-sm space-y-1">
                        {Object.entries({
                          length: "At least 6 characters",
                          hasNumber: "Contains a number",
                          hasUpper: "Contains an uppercase letter",
                          hasLower: "Contains a lowercase letter",
                          hasSpecial: "Contains a special character"
                        }).map(([key, text]) => (
                          <li key={key} className="flex items-center">
                            {passwordStrength[key] ? (
                              <FaCheck className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <FaTimes className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span className={passwordStrength[key] ? "text-green-700" : "text-red-500"}>
                              {text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile; 