// src/components/AdminRoute.jsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';

import {
  selectIsLoggedIn,
  selectIsAdmin,
  selectHydrating,
} from '../store/authSlice';

const AdminRoute = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isAdmin    = useSelector(selectIsAdmin);
  const hydrating  = useSelector(selectHydrating);
  const location   = useLocation();

  // ── Show loader while restoring session (important for refresh)
  if (hydrating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  // ── Not logged in → go to login
  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // ── Not admin → go to home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // ── All good → render child routes
  return <Outlet />;
};

export default AdminRoute;