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
      <Link 
        to="/logout"
        className="text-red-600 hover:text-red-700"
      >
        Logout
      </Link>
    </div>
  );
};

export default JobSeekerNav;
