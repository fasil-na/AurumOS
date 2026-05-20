import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they try to access unauthorized route
    if (user.role === 'Super Admin') return <Navigate to="/super-admin" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Employee') return <Navigate to="/employee" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
