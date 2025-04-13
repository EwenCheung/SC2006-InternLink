import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const EmployerNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Navigation item configuration
  const navItems = [
    { label: 'Post Internship', path: '/employer/post-internship', icon: 'M12 4v16m8-8H4' },
    { label: 'Post Ad-Hoc', path: '/employer/post-adhoc', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { label: 'Messages', path: '/employer/messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { label: 'Profile', path: '/employer/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

  // Check if the path matches the current location
  const isActive = (path) => {
    return currentPath.startsWith(path);
  };

  return (
    <div className="flex items-center">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-1">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 relative whitespace-nowrap
              ${isActive(item.path) 
                ? 'text-purple-700' 
                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'}`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 mr-1.5 ${isActive(item.path) ? 'text-purple-500' : 'text-gray-400'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {item.label}
            {isActive(item.path) && (
              <div className="absolute bottom-0 left-0 right-0 mx-auto w-full h-0.5 bg-purple-500"></div>
            )}
          </Link>
        ))}

        {/* Settings Dropdown - Fixed hover behavior */}
        <div className="relative group">
          <button 
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 flex items-center space-x-1 whitespace-nowrap"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            <span>Settings</span>
          </button>
          
          {/* Invisible connector that ensures continuous hover area */}
          <div className="absolute top-full left-0 h-2 w-full group-hover:block hidden"></div>
          
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-md shadow-lg hidden group-hover:block transition-opacity duration-150 z-50">
            <div className="py-1">
              <Link 
                to="/employer/ep-privacy-settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
                Change Password
              </Link>
              <Link 
                to="/logout"
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu Button */}
      <div className="md:hidden flex items-center">
        <button className="mobile-menu-button p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 focus:outline-none">
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
        </button>
      </div>
    </div>
  );
};

export default EmployerNav;
