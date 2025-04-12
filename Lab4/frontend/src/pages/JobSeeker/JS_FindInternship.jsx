import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JS_FindInternship.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const JS_FindInternship = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/internships`);
        const { data } = await response.json();
        if (response.ok && data) {
          setInternships(data);
        } else {
          setError(data.message || 'Failed to fetch internships');
        }
      } catch (err) {
        setError('An error occurred while fetching internships');
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Find Internships</h1>
      <div className={styles.internshipList}>
        {internships.map((internship) => (
          <div key={internship._id} className={styles.jobCard}>
            <div className={styles.cardHeader}>
              <img src={internship.companyLogo || '/images/Logo2.png'} alt="Company Logo" className={styles.companyLogo} />
              <div className={styles.basicInfo}>
                <h2 className={styles.jobTitle}>{internship.title}</h2>
                <h3 className={styles.companyName}>{internship.company}</h3>
              </div>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.location}>📍 {internship.location}</p>
              <p className={styles.duration}>⏱️ {internship.duration}</p>
              <p className={styles.salary}>💰 {internship.stipend}/month</p>
            </div>
            <div className={styles.cardActions}>
              {internship.isApplied ? (
                <>
                  <button 
                    className={styles.viewApplicationButton} 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/jobseeker/view-application/${internship.applicationId}`);
                    }}
                  >
                    View Application
                  </button>
                </>
              ) : (
                <button 
                  className={styles.applyButton} 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/jobseeker/internship-application/${internship._id}`);
                  }}
                >
                  Apply Now
                </button>
              )}
              <button 
                className={styles.detailsButton} 
                onClick={() => navigate(`/jobseeker/internship/${internship._id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JS_FindInternship;