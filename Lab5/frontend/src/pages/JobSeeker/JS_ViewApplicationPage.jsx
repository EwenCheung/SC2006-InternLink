import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JS_ViewApplicationPage.module.css';
import { FaSearch, FaFilter, FaCalendarAlt, FaBuilding, FaClock } from 'react-icons/fa';

const JS_ViewApplicationPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [jobseekerId, setJobseekerId] = useState(null);
  const [details, setDetails] = useState({ name: '', email: '' });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    const user = localStorage.getItem('user');
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        setDetails({ name: userData.name, email: userData.email });
        setJobseekerId(userData._id);
        
      } catch (err) {
        console.error('Error parsing user data:', err);
        navigate('/jobseeker/login');
      }
    } else {
      navigate('/jobseeker/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/jobseeker/login');
          return;
        }

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        // Fix the endpoint URL - Ensure it matches your backend route exactly
        // The correct parameter name should be 'jobseekerId' not just 'id'
        const response = await fetch(`${API_BASE_URL}/api/jobs/get-all-application/${jobseekerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // Log the response for debugging
          console.error('Response status:', response.status);
          const errorText = await response.text();
          console.error('Response body:', errorText);
          throw new Error(`Failed to fetch applications: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received application data:', data); // Debug log
        
        // Add detailed log to check each application's jobType
        if (data.data && data.data.length > 0) {
          console.log('Job types in applications:', data.data.map(app => ({
            id: app.id,
            jobType: app.jobType
          })));
        }
        
        setApplications(data.data || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch applications if we have a jobseekerId
    if (jobseekerId) {
      fetchApplications();
    }
  }, [jobseekerId, navigate]);

  const handleWithdrawClick = (applicationId) => {
    setApplicationToWithdraw(applicationId);
    setShowConfirmation(true);
  };

  const confirmWithdrawal = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/jobseeker/login');
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      
      // Make sure we're using the exact route from your backend
      const response = await fetch(`${API_BASE_URL}/api/jobs/delete-application/${applicationToWithdraw}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Get detailed error information if available
        let errorDetail = '';
        try {
          const errorResponse = await response.json();
          errorDetail = errorResponse.message || '';
        } catch (e) {
          // If we can't parse the error response, ignore it
        }
        
        throw new Error(`Failed to withdraw application: ${errorDetail}`);
      }

      // Success handling
      
      // Remove the application from the list
      setApplications(prev => prev.filter(app => app.id !== applicationToWithdraw));
      
      // Close the confirmation dialog
      setShowConfirmation(false);

      // Show success message instead of alert
      setSuccessMessage('Application withdrawn successfully');
      setShowSuccessMessage(true);

      // Auto-hide the success message after 0.8 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 800);
    } catch (err) {
      console.error('Error withdrawing application:', err);
      setError(err.message);
      // Close the confirmation dialog even if there's an error
      setShowConfirmation(false);
      setApplicationToWithdraw(null);
    } finally {
      setLoading(false);
    }
  };

  const cancelWithdrawal = () => {
    setShowConfirmation(false);
    setApplicationToWithdraw(null);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || app.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return styles.statusPending;
      case 'accepted':
        return styles.statusAccepted;
      case 'rejected':
        return styles.statusRejected;
      default:
        return '';
    }
  };

  const handleViewDetails = (applicationId, jobId) => {
    // Navigate to application details using the application ID as the parameter
    navigate(`/jobseeker/applications/${applicationId}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/jobseeker/find-internship')}
          className={styles.returnButton}
        >
          Find Internships
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Applications</h1>
        <p>Track the status of all your job applications</p>
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterContainer}>
          <FaFilter className={styles.filterIcon} />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No applications yet</h2>
          <p>Start your career journey by applying for internships!</p>
          <button 
            onClick={() => navigate('/jobseeker/find-internship')}
            className={styles.findJobsButton}
          >
            Find Internships
          </button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No matching applications</h2>
          <p>Try changing your search or filter criteria</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className={styles.resetButton}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={styles.applicationsGrid}>
          {filteredApplications.map((application) => (
            <div key={application.id} className={styles.applicationCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.jobTitle}>{application.jobTitle}</h2>
                <span className={`${styles.statusBadge} ${getStatusClass(application.status)}`}>
                  {application.status}
                </span>
              </div>
              
              <div className={styles.companyInfo}>
                <FaBuilding className={styles.infoIcon} />
                <span>{application.company}</span>
                {/* Provide a job type tag with better fallback handling */}
                <span className={styles.jobTypeTag}>
                  {application.jobType ? 
                    (application.jobType.includes('internship') ? 'Internship' : 'Ad Hoc') : 
                    'Job Application'}
                </span>
              </div>
              
              {/* Add a fixed height container for the application details */}
              <div className={styles.applicationDetails} style={{ minHeight: '60px' }}>
                <div className={styles.detailItem}>
                  <FaCalendarAlt className={styles.infoIcon} />
                  <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                </div>
                {application.updatedAt && application.updatedAt !== application.appliedDate && (
                  <div className={styles.detailItem}>
                    <FaClock className={styles.infoIcon} />
                    <span>Updated: {new Date(application.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              {/* Position the action buttons at the bottom of the card */}
              <div className={styles.cardActions}>
                <button 
                  className={styles.viewDetailsButton}
                  onClick={() => {
                    // Navigate to the job details page based on job type
                    if (application.jobType && application.jobType.includes('internship')) {
                      navigate(`/jobseeker/internship/${application.jobId}`);
                    } else {
                      navigate(`/jobseeker/adhoc/${application.jobId}`);
                    }
                  }}
                >
                  View Job Details
                </button>
                <button 
                  className={styles.withdrawButton}
                  onClick={() => handleWithdrawClick(application.id)}
                >
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuccessMessage && (
        <div className={styles.successOverlay}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <h3>Success!</h3>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className={styles.confirmationOverlay}>
          <div className={styles.confirmationDialog}>
            <h3>Withdraw Application</h3>
            <p>Are you sure you want to withdraw this application? This action cannot be undone.</p>
            <div className={styles.confirmationButtons}>
              <button 
                className={styles.cancelButton}
                onClick={cancelWithdrawal}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton}
                onClick={confirmWithdrawal}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JS_ViewApplicationPage;