// src/context/AuthContext.jsx

import React, { createContext, useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, selectToken, logout as logoutAction } from '../store/authSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user     = useSelector(selectUser);
  const token    = useSelector(selectToken);
  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, token, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};

export default AuthContext;