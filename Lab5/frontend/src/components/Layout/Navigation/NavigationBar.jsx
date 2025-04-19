import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import JobSeekerNav from './JobSeekerNav';
import EmployerNav from './EmployerNav';
const Logo = '/images/Logo2.png'; // Access public assets directly

const NavigationBar = () => {
  const location = useLocation();
  const path = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Don't show navbar on the choose role page or when path is root
  if (path === '/' || path === '/logout') {
    return null;
  }

  // Determine which navigation to show based on the path
  const isJobSeeker = path.startsWith('/jobseeker');
  const isEmployer = path.startsWith('/employer');

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to={isJobSeeker ? "/jobseeker/find-internship" : "/employer/post-internship"} 
            className="flex items-center space-x-3"
          >
            <img 
              src={Logo} 
              alt="InternLink Logo" 
              className="h-10 w-auto" 
            />
            <span className="absolute left-[-1000px] font-semibold text-xl text-purple-800">
              InternLink
            </span>
          </Link>
          
          {/* Main Navigation */}
          {isJobSeeker && (
            <div className="w-full max-w-xl">
              <JobSeekerNav />
            </div>
          )}
          {isEmployer && (
            <div className="w-full max-w-xl">
              <EmployerNav />
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-2">
          {isJobSeeker && (
            <div className="space-y-1 pb-3 pt-2">
              <Link 
                to="/jobseeker/find-internship" 
                className={`block px-3 py-2 rounded-md font-medium ${path.startsWith('/jobseeker/find-internship') ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
              >
                Find Internships
              </Link>
              <Link 
                to="/jobseeker/find-adhoc" 
                className={`block px-3 py-2 rounded-md font-medium ${path.startsWith('/jobseeker/find-adhoc') ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
              >
                Find Ad-Hoc Jobs
              </Link>
              <Link 
                to="/jobseeker/messages" 
                className={`block px-3 py-2 rounded-md font-medium ${path.startsWith('/jobseeker/messages') ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
              >
                Messages
              </Link>
              <Link 
                to="/jobseeker/profile" 
                className={`block px-3 py-2 rounded-md font-medium ${path.startsWith('/jobseeker/profile') ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
              >
                Profile
              </Link>
              <Link 
                to="/jobseeker/js-privacy-settings" 
                className={`block px-3 py-2 rounded-md font-medium ${path.startsWith('/jobseeker/js-privacy-settings') ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
              >
                Settings
              </Link>
              <Link 
                to="/logout" 
                className="block px-3 py-2 rounded-md font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </Link>
            </div>
          )}
          {isEmployer && (
            <div className="space-y-1 pb-3 pt-2">
              <Link 
                to="/employer/post-internship" 
                className={`block px-3 py-2 rounded-md font-medium ${path.startsWith('/employer/post-internship') ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
              >
                Post Internship
              </Link>
              <Link 
                to="/employer/post-adhoc" 
                className={`block px-3 py-2 rounded-md font-medium ${path.startsWith('/employer/post-adhoc') ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
              >
                Post Ad-Hoc
              </Link>
              <Link 
                to="/employer/messages" 
                className={`block px-3 py-2 rounded-md font-medium ${path.startsWith('/employer/messages') ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
              >
                Messages
              </Link>
              <Link 
                to="/employer/profile" 
                className={`block px-3 py-2 rounded-md font-medium ${path.startsWith('/employer/profile') ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
              >
                Profile
              </Link>
              <Link 
                to="/employer/ep-privacy-settings" 
                className={`block px-3 py-2 rounded-md font-medium ${path.startsWith('/employer/ep-privacy-settings') ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
              >
                Settings
              </Link>
              <Link 
                to="/logout" 
                className="block px-3 py-2 rounded-md font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;
