import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './authContext';


export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (token) {
        const decodedUser = jwtDecode(token).user;
        setUser(decodedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      setUser(null);
      localStorage.removeItem('token');
    }finally {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };
  
  const value = { token, user, loading,login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
