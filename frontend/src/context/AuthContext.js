import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('levelup_token');
    if (!token) { 
      setLoading(false); 
      return; 
    }
    try {
      const res = await authAPI.me();
      setUser(res.data.user);
    } catch (error) {
      console.error('❌ Failed to fetch user:', error.message);
      localStorage.removeItem('levelup_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchMe(); 
  }, [fetchMe]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      localStorage.setItem('levelup_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      console.error('❌ Login failed:', error.message || error);
      throw error;
    }
  };

  const register = async (username, email, password, avatarColor) => {
    try {
      const res = await authAPI.register({ username, email, password, avatarColor });
      localStorage.setItem('levelup_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      console.error('❌ Registration failed:', error.message || error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('levelup_token');
    setUser(null);
  };

  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refetchUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
