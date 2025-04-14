import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const PrivacySettings = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordReqs, setPasswordReqs] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const validatePassword = (password) => {
    const reqs = {
      length: password.length >= 8 && password.length <= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@$!%*?&]/.test(password),
    };
    setPasswordReqs(reqs);
    return Object.values(reqs).every(req => req);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Password does not meet requirements.');
      return;
    }

    setError('');
    setSuccess('');
    setIsChangingPassword(true);

    try {
      // Get token and user ID from localStorage
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user || !user.id) {
        setError('Authentication error. Please log in again.');
        setIsChangingPassword(false);
        return;
      }

      // Use resetPassword endpoint directly
      const changeResponse = await fetch(`${API_BASE_URL}/api/auth/employer/reset-password/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          password: newPassword
        })
      });

      const changeData = await changeResponse.json();

      if (changeResponse.ok) {
        setSuccess('Password changed successfully');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
        
        // Show success modal
        setShowModal(true);
        
        // Log out and redirect after a delay
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/employer/login');
        }, 3000); // 3 second delay
      } else {
        setError(changeData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded relative">
      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
          <div className="text-center p-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Password Changed Successfully!</h3>
            <p className="text-gray-600 text-center mb-4">
              Your password has been updated. You will be redirected to the login page in a few seconds.
            </p>
            <div className="text-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full animate-progressBar"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <h1 className="text-2xl font-bold mb-4">Password Change Request</h1>
      <form onSubmit={handleChangePassword}>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="currentPassword">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            className="w-full px-4 py-2 border rounded"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="newPassword">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            className="w-full px-4 py-2 border rounded"
            value={newPassword}
            onChange={(e) => {
              const value = e.target.value;
              setNewPassword(value);
              validatePassword(value);
            }}
            required
          />
          <div className="text-sm text-gray-600 mt-2">
            <div className={`flex items-center mt-1 ${passwordReqs.length ? 'text-green-500' : 'text-red-500'}`}>
              <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>8-12 characters</span>
            </div>
            <div className={`flex items-center mt-1 ${passwordReqs.uppercase ? 'text-green-500' : 'text-red-500'}`}>
              <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>One uppercase letter</span>
            </div>
            <div className={`flex items-center mt-1 ${passwordReqs.lowercase ? 'text-green-500' : 'text-red-500'}`}>
              <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>One lowercase letter</span>
            </div>
            <div className={`flex items-center mt-1 ${passwordReqs.number ? 'text-green-500' : 'text-red-500'}`}>
              <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>One number</span>
            </div>
            <div className={`flex items-center mt-1 ${passwordReqs.special ? 'text-green-500' : 'text-red-500'}`}>
              <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>One special character (@$!%*?&)</span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-2 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          disabled={isChangingPassword}
        >
          {isChangingPassword ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default PrivacySettings;
