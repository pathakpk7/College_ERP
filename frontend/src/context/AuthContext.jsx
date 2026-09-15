import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getStoredUser, getCurrentUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then((userData) => {
          if (userData && userData.full_name) {
            setUser((prev) => {
              const updated = { ...prev, ...userData };
              localStorage.setItem('user', JSON.stringify(updated));
              return updated;
            });
          }
        })
        .catch(() => {
          // Token might be invalid or expired; leave as is or let API interceptor handle 401
        });
    }
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
