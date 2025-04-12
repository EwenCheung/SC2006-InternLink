import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useEffect, useState } from 'react';

import styles from './ApplicationDetailPage.module.css';

const JS_InternshipApplicationPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams(); // Use route parameter instead of query parameter
  const [details, setDetails] = useState({ name: '', email: '' });
  const [jobseekerID, setJobseekerID] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        setDetails({ name: userData.name, email: userData.email });
        setJobseekerID(userData._id);
        console.log('User ID loaded:', userData._id); // Add logging to verify ID is set
      } catch (err) {
        console.error('Error parsing user data:', err);
        navigate('/jobseeker/login');
      }
    } else {
      navigate('/jobseeker/login');
    }
  }, [navigate]); // Add navigate to dependency array

  const handleSubmit = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const url = `${API_BASE_URL}/api/jobs/create-application/${jobId}`; 
      const method = 'POST';
      
      // Get the JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      
      // Fix: Adjust property names to match what the server expects
      const postData = {
        jobId: jobId,         // Changed from 'job' to 'jobId'
        applicantId: jobseekerID,
        jobType:'internship'  // Changed from 'jobSeeker' to 'applicantId'
        
      };

      console.log('Request Payload:', postData);
      console.log('Request Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        // Try to get more detailed error information from the response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = `${errorData.message}`;
          }
        } catch (e) {
          // If we can't parse the error response, use the default message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Application submitted:', data);
      
      // Store application ID for viewing details and show dialog instead of alert
      setApplicationId(data.applicationId || data._id);
      setShowDialog(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      // Use error dialog with purple theme styling
      setError(error.message);
    }
  };

  // Handle dialog actions
  const handleViewApplication = () => {
    setShowDialog(false);
    navigate(`/jobseeker/applications/${applicationId}`);
  };

  const handleFindMoreInternships = () => {
    setShowDialog(false);
    navigate('/jobseeker/find-internship');
  };

  const handleCloseError = () => {
    setError(null);
  };

  // Success Dialog Component
  const SuccessDialog = () => (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <div className={styles.dialogHeader}>
          <h3>Application Submitted!</h3>
        </div>
        <div className={styles.dialogBody}>
          <p>Your application has been submitted successfully.</p>
          <p>What would you like to do next?</p>
        </div>
        <div className={styles.dialogActions}>
          <button 
            onClick={handleViewApplication}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            View Application
          </button>
          <button 
            onClick={handleFindMoreInternships}
            className={styles.button}
          >
            Find More Internships
          </button>
        </div>
      </div>
    </div>
  );

  // Error Dialog Component
  const ErrorDialog = () => (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <div className={styles.dialogHeader}>
          <h3>Submission Failed</h3>
        </div>
        <div className={styles.dialogBody}>
          <p>Failed to submit application:</p>
          <p className={styles.errorMessage}>{error}</p>
        </div>
        <div className={styles.dialogActions}>
          <button 
            onClick={handleCloseError}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            Try Again
          </button>
          <button 
            onClick={() => {
              handleCloseError();
              navigate('/jobseeker/find-internship');
            }}
            className={styles.button}
          >
            More Internships
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <button 
        onClick={() => navigate('/jobseeker/find-internship')}
        className={styles.backButton}
      >
        Back
      </button>

      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Verify Your Details</h2>
          <p className={styles.subtitle}>Ensure your information is correct before applying</p>
        </div>

        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
              className={styles.input}
              placeholder="Enter your name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={details.email}
              onChange={(e) => setDetails({ ...details, email: e.target.value })}
              className={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="resume" className={styles.label}>Resume</label>
            <input
              type="file"
              id="resume"
              name="resume"
              className={styles.fileInput}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className={styles.enhancedSubmitButton}
            disabled={jobseekerID === null} // More explicit condition
            style={{ 
              backgroundColor: '#6f42c1', 
              color: 'white',
              background: 'linear-gradient(135deg, #8e44ad, #6f42c1)',
              cursor: jobseekerID === null ? 'not-allowed' : 'pointer' // Visual feedback
            }}
          >
            {jobseekerID === null ? 'Loading...' : 'Submit Application'}
          </button>
        </form>
      </div>

      {showDialog && <SuccessDialog />}
      {error && <ErrorDialog />}
    </div>
  );
};

export default JS_InternshipApplicationPage;