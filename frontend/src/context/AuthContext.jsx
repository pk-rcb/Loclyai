import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, getAccessToken, clearAuth, setAccessToken, setUser as storeUser } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if user is already logged in
  useEffect(() => {
    const storedUser = getUser();
    const token = getAccessToken();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData, accessToken) => {
    storeUser(userData);
    setAccessToken(accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      const userType = user?.type || 'citizen';
      await fetch(`http://localhost:5000/api/${userType}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
