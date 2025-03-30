import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ role }) => {
  const location = useLocation();
  // Check if user is authenticated by looking for token
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate 
      to={`/${role}/login`} 
      replace 
      state={{ from: location }} 
    />;
  }

  // If role doesn't match, redirect to appropriate landing page
  if (role && role !== userRole) {
    if (userRole === 'jobseeker') {
      return <Navigate to="/jobseeker/find-internship" replace />;
    } else if (userRole === 'employer') {
      return <Navigate to="/employer/post-internship" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
