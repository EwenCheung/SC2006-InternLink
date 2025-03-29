import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ role }) => {
  const location = useLocation();
  // Check if user is authenticated by looking for token
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  
  // Get user role from token or localStorage
  const userRole = localStorage.getItem('userRole');

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate 
      to={`/${role}/login`} 
      replace 
      state={{ from: location }} 
    />;
  }

  // If role doesn't match, redirect to home
  if (role && role !== userRole) {
    return <Navigate to="/" replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
