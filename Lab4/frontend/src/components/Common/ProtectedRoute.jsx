import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  // TODO: Replace with actual auth logic
  const isAuthenticated = true; // Temporary, replace with actual auth check
  const userRole = location.pathname.includes('jobseeker') ? 'jobseeker' : 'employer';

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
