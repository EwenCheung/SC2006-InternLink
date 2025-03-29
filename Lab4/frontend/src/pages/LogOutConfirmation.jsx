import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogOutConfirmation = () => {
  const navigate = useNavigate();

  const handleLogOut = () => {
    // Clear all auth related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    // Navigate to home page
    navigate('/', { replace: true });
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Confirm Logout
        </h1>
        <p className="text-gray-600 mb-8">
          Are you sure you want to log out?
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLogOut}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogOutConfirmation;
