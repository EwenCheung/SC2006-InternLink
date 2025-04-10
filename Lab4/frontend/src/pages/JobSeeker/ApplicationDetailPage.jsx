import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ApplicationDetailPage.module.css';

const ApplicationDetailPage = () => {
  const navigate = useNavigate();
  const [details, setDetails] = useState({ name: '', email: '' });
  const [jobseekerID, setJobseekerID] = useState(null);

  useEffect(() => {

    const user = localStorage.getItem('user');
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        setDetails({ name: userData.name, email: userData.email });
        setJobseekerID(userData._id);
        
      } catch (err) {
        console.error('Error parsing user data:', err);
        navigate('/jobseeker/login');
      }
    } else {
      navigate('/jobseeker/login');
    }
  }, []);

  const handleSubmit = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId'); // Extract jobId from the updated route
    
    
    try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    const url = `${API_BASE_URL}/applications`;
    const method = 'POST';
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    const postData = {
      job: jobId,
      jobSeeker: jobseekerID,
      coverLetter: 'This is my cover letter.',
      resume: 'resume.pdf',
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Application submitted:', data);
    alert('Your application has been submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

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
            className={`${styles.button} ${styles.primaryButton}`}
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;
