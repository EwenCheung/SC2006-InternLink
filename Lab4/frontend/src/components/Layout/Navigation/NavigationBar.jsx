import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import JobSeekerNav from './JobSeekerNav';
import EmployerNav from './EmployerNav';

const NavigationBar = () => {
  const location = useLocation();
  const path = location.pathname;

  // Don't show navbar on the choose role page or when path is root
  if (path === '/' || path === '/logout') {
    return null;
  }

  // Determine which navigation to show based on the path
  const isJobSeeker = path.startsWith('/jobseeker');
  const isEmployer = path.startsWith('/employer');

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-purple-600">
            InternLink
          </Link>
          
          {isJobSeeker && <JobSeekerNav />}
          {isEmployer && <EmployerNav />}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
