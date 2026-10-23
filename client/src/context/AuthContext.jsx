import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('smart_pds_token'));
  const [rationCard, setRationCard] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user profile if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('smart_pds_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setRationCard(res.data.rationCard);
            setShop(res.data.shop);
          }
        } catch (err) {
          console.error('Session restore failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('smart_pds_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setRationCard(res.data.rationCard);
      setShop(res.data.shop);
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('smart_pds_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setRationCard(res.data.rationCard);
      setShop(res.data.shop);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('smart_pds_token');
    localStorage.removeItem('smart_pds_user');
    setToken(null);
    setUser(null);
    setRationCard(null);
    setShop(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setRationCard(res.data.rationCard);
        setShop(res.data.shop);
      }
    } catch (err) {
      console.error('Refresh profile error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        rationCard,
        shop,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!token && !!user,
        isBeneficiary: user?.role === 'BENEFICIARY',
        isShopOwner: user?.role === 'SHOP_OWNER',
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
