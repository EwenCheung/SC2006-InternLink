import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import JobSeekerNav from './JobSeekerNav';
import EmployerNav from './EmployerNav';
const Logo = '/images/Logo2.png'; // Access public assets directly

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
    <nav className="bg-white shadow-md sticky top-0 z-50"> {/* Added sticky class */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/jobseeker/find-internship" className="flex items-center">
            <img src={Logo} alt="InternLink Logo" className="h-8 w-auto" /> {/* Add logo image */}
            <h1 className="sr-only">InternLink</h1> {/* Hidden text for screen readers */}
          </Link>
          
          {isJobSeeker && <JobSeekerNav />}
          {isEmployer && <EmployerNav />}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
