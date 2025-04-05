import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
      } catch (error) {
        return false;
      }
    }
    return false;
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        return decoded.is_admin || false;
      } catch (error) {
        return false;
      }
    }
    return false;
  });
  const [user, setUser] = useState(() => {
    const savedUserData = localStorage.getItem('userData');
    return savedUserData ? JSON.parse(savedUserData) : null;
  });

  // Check token expiration and restore user session
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token has expired
            handleLogout();
          } else {
            setIsAuthenticated(true);
            setIsAdmin(decoded.is_admin || false);
            
            // Get user data from localStorage if not already set
            if (!user) {
              const userData = localStorage.getItem('userData');
              if (userData) {
                setUser(JSON.parse(userData));
              }
            }

            // Set timeout to check again near expiration
            const timeUntilExpiry = (decoded.exp - currentTime) * 1000;
            const timeoutId = setTimeout(handleLogout, timeUntilExpiry);
            return () => clearTimeout(timeoutId);
          }
        } catch (error) {
          // Invalid token
          handleLogout();
        }
      } else {
        // Check if we have valid data in localStorage
        const savedToken = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (savedToken && userData) {
          try {
            const decoded = jwtDecode(savedToken);
            const currentTime = Date.now() / 1000;
            
            if (decoded.exp > currentTime) {
              // Valid token found in localStorage
              setToken(savedToken);
              setUser(JSON.parse(userData));
              setIsAuthenticated(true);
              setIsAdmin(decoded.is_admin || false);
            } else {
              // Token expired
              handleLogout();
            }
          } catch (error) {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      }
    };

    checkTokenExpiration();
  }, [token]);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    
    try {
      const decoded = jwtDecode(newToken);
      setIsAdmin(decoded.is_admin || false);
    } catch (error) {
      console.error('Error decoding token:', error);
      setIsAdmin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setToken(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  };

  const updateUserProfile = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    localStorage.setItem('userData', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value = {
    token,
    isAuthenticated,
    isAdmin,
    user,
    login: handleLogin,
    logout: handleLogout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 