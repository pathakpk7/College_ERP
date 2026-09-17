import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getStoredUser, getCurrentUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then((userData) => {
          if (userData && (userData.full_name || userData.role)) {
            setUser((prev) => {
              const updated = { ...prev, ...userData };
              localStorage.setItem('user', JSON.stringify(updated));
              return updated;
            });
          }
        })
        .catch(() => {
          // Token is expired or invalid -> clear user state and local storage immediately
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        });
    } else {
      // If no token exists, ensure user is not stuck in state
      localStorage.removeItem('user');
      setUser(null);
    }

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);


  const login = async (identifier, password, captcha_id, captcha_solution, designation = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin(identifier, password, captcha_id, captcha_solution, designation);
      setUser(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid login details or captcha solution.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRegister(formData);
      setUser(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
