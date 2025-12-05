import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, register, getProfile, updateProfile, changePassword } from '../services/apiService';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Fetch user profile if token exists but no user data
      if (!user) {
        fetchUserProfile();
      }
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setUser(response.user);
      setError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error.message);
      // If token is invalid, clear auth state
      if (error.message.includes('token') || error.message.includes('401')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await loginRequest(credentials);
      
      setToken(response.token);
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const registerUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await register(userData);
      
      setToken(response.token);
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await updateProfile(profileData);
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const updatePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await changePassword(passwordData);
      
      return response;
    } catch (error) {
      setError(error.message || 'Password change failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Check if user is moderator or admin
  const isModerator = user?.role === 'moderator' || user?.role === 'admin';

  // Clear error
  const clearError = () => setError(null);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isModerator,
    login,
    registerUser,
    logout,
    updateUserProfile,
    updatePassword,
    fetchUserProfile,
    clearError
  }), [token, user, loading, error, isAuthenticated, isAdmin, isModerator]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};

export { AuthProvider, useAuth };
