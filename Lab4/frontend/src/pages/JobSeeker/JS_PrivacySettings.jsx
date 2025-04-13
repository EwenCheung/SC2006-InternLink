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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      setError('Password does not meet requirements.');
      setSuccess('');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const user = localStorage.getItem('user');
      const userData = JSON.parse(user);
      const jobseekerID = userData._id; // Use _id directly from userData
      const token = localStorage.getItem('token'); // Retrieve token from localStorage

      const response = await fetch(`${API_BASE_URL}/api/auth/resetPassword/${jobseekerID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: jobseekerID,
          currentPassword,
          password: newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Show success modal
      setShowModal(true);
      
      // Log out and redirect after a delay
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/jobseeker/login');
      }, 3000); // 3 second delay
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded relative">
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-6 rounded-lg shadow-xl z-10 max-w-md w-full mx-4">
            <div className="flex items-center justify-center text-green-500 mb-4">
              <svg className="w-12 h-12" viewBox="0 0 20 20" fill="currentColor">
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
      <form onSubmit={handleSubmit}>
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
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

// Add this to your global CSS or use inline styles
// .animate-progressBar {
//   width: 0%;
//   animation: progressAnimation 3s linear forwards;
// }
// @keyframes progressAnimation {
//   0% { width: 0%; }
//   100% { width: 100%; }
// }

export default PrivacySettings;
