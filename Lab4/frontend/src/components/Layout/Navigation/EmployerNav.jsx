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
      <Link 
        to="/logout"
        className="text-red-600 hover:text-red-700"
      >
        Logout
      </Link>
    </div>
  );
};

export default EmployerNav;
