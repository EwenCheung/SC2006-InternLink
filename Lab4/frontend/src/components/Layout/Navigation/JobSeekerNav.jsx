import React from 'react';
import { Link } from 'react-router-dom';

const JobSeekerNav = () => {
  return (
    <div className="flex items-center space-x-4">
      <Link 
        to="/jobseeker/find-internship"
        className="text-gray-600 hover:text-purple-600"
      >
        Find Internships
      </Link>
      <Link 
        to="/jobseeker/find-adhoc"
        className="text-gray-600 hover:text-purple-600"
      >
        Find Ad-Hoc Jobs
      </Link>
      <Link 
        to="/jobseeker/messages"
        className="text-gray-600 hover:text-purple-600"
      >
        Messages
      </Link>
      <Link 
        to="/jobseeker/profile"
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
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
      <Link 
            to="/jobseeker/js-privacy-settings"
        className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
      >
        Privacy Settings
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

      export default JobSeekerNav;
