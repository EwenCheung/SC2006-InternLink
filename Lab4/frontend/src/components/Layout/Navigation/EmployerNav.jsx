import React from 'react';
import { Link } from 'react-router-dom';

const EmployerNav = () => {
  return (
    <div className="flex items-center space-x-4">
      <Link 
        to="/employer/post-internship"
        className="text-gray-600 hover:text-purple-600"
      >
        Post Internship
      </Link>
      <Link 
        to="/employer/post-adhoc"
        className="text-gray-600 hover:text-purple-600"
      >
        Post Ad-Hoc
      </Link>
      <Link 
        to="/employer/messages"
        className="text-gray-600 hover:text-purple-600"
      >
        Messages
      </Link>
      <Link 
        to="/employer/profile"
        className="text-gray-600 hover:text-purple-600"
      >
        Profile
      </Link>
      <div 
        className="relative group"
      >
        <button className="text-gray-600 hover:text-purple-600">
          Settings
        </button>
        <div 
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block transition-all duration-300 group-hover:duration-200 group-hover:delay-0 delay-700 pt-2 pb-1 before:content-[''] before:absolute before:top-[-16px] before:left-0 before:right-0 before:h-4"
        >
          <Link 
            to="/employer/ep-privacy-settings"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Change Password
          </Link>
          <Link 
            to="/logout"
            className="block px-4 py-2 text-red-500 hover:bg-gray-100"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployerNav;
