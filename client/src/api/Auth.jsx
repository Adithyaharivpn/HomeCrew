import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './authContext';
import api from './axiosConfig';


export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchUser = async () => {
      if (token) {
        try {
          // Fetch fresh user data from DB to ensure status is synced
          const { data } = await api.get('/api/auth/me');
          setUser(data);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          // Fallback to decoding token if API fails (e.g. network error)
          // But if 401, likely token invalid
          if (error.response?.status === 401) {
             sessionStorage.removeItem('token');
             setToken(null);
             setUser(null);
          } else {
             // Try to use decoded token as fallback for non-critical errors
             try {
                const decodedUser = jwtDecode(token).user;
                setUser(decodedUser);
             } catch (e) {
                setUser(null);
             }
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (newToken) => {
    sessionStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
  };
  
  const value = { token, user, loading,login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
