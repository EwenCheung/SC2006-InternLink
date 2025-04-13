import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import styles from './JS_JobDetailsPage.module.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaGraduationCap, FaDollarSign, FaClock, FaBuilding, FaArrowLeft, FaShareAlt, FaComment, FaTimes, FaBriefcase } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const JS_InternshipDetailsPage = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [jobDetails, setJobDetails] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobseekerId, setJobseekerId] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showFeatureMessage, setShowFeatureMessage] = useState(false);
  const [featureMessage, setFeatureMessage] = useState('');
  const [formattedDeadline, setFormattedDeadline] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setJobseekerId(userData._id);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/internship/${jobId}`);
        const { data } = await response.json();
        if (response.ok && data) {
          console.log('Job details:', data);
          setJobDetails(data);
          
          // Format the application deadline
          if (data.applicationDeadline) {
            const deadlineDate = new Date(data.applicationDeadline);
            setFormattedDeadline(deadlineDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }));
          }
        } else {
          setError(data?.message || 'Failed to fetch job details');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('An error occurred while fetching job details');
      } finally {
        setLoading(false);
      }
    };

    const fetchCoordinates = async (address) => {
      try {
        const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(address)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
        const tokenResponse = await fetch(`${API_BASE_URL}/use-token`);
        const tokenData = await tokenResponse.json();
        const authToken = tokenData.token;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `${authToken}`,
          }
        });
        const data = await response.json();
        if (data.results?.length > 0) {
          const { LATITUDE: fetchedLatitude, LONGITUDE: fetchedLongitude } = data.results[0];
          setLatitude(fetchedLatitude);
          setLongitude(fetchedLongitude);
        }
      } catch (err) {
        console.error('Error fetching coordinates:', err);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  // Fetch coordinates when job details load
  useEffect(() => {
    if (jobDetails?.location && (!latitude || !longitude)) {
      const fetchCoordinates = async () => {
        try {
          const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(jobDetails.location)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
          const tokenResponse = await fetch(`${API_BASE_URL}/use-token`);
          const tokenData = await tokenResponse.json();
          const authToken = tokenData.token;

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `${authToken}`,
            }
          });
          const data = await response.json();
          if (data.results?.length > 0) {
            const { LATITUDE: fetchedLatitude, LONGITUDE: fetchedLongitude } = data.results[0];
            setLatitude(fetchedLatitude);
            setLongitude(fetchedLongitude);
          }
        } catch (err) {
          console.error('Error fetching coordinates:', err);
        }
      };

      fetchCoordinates();
    }
  }, [jobDetails, latitude, longitude]);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!jobseekerId || !jobId) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/jobs/check-application-status/${jobseekerId}/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.hasApplied) {
            setIsApplied(true);
          } else {
            setIsApplied(false);
          }
        }
      } catch (err) {
        console.error('Error checking application status:', err);
      }
    };

    checkApplicationStatus();
  }, [jobId, jobseekerId]);

  const handleWithdrawApplication = async () => {
    setShowConfirmation(true);
  };

  const confirmWithdrawal = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/jobseeker/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/jobs/delete-application/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw application');
      }

      setIsApplied(false);
      setShowConfirmation(false);

      // Show success message instead of alert
      setFeatureMessage('Application withdrawn successfully!');
      setShowFeatureMessage(true);
      
      setTimeout(() => {
        setShowFeatureMessage(false);
      }, 1500);
    } catch (err) {
      console.error('Error withdrawing application:', err);
      setShowConfirmation(false);
    }
  };

  const cancelWithdrawal = () => {
    setShowConfirmation(false);
  };

  const handleMessageEmployer = () => {
    setFeatureMessage('The messaging feature is currently under development and will be available soon!');
    setShowFeatureMessage(true);
    
    setTimeout(() => {
      setShowFeatureMessage(false);
    }, 1500);
  };

  const handleShareJob = () => {
    setFeatureMessage('The job sharing feature is currently under development and will be available soon!');
    setShowFeatureMessage(true);
    
    setTimeout(() => {
      setShowFeatureMessage(false);
    }, 1500);
  };

  const formatDurationToMonths = (duration) => {
    if (!duration) return 'Not specified';
    const match = duration.match(/(\d+)/);
    if (match) {
      const months = parseInt(match[0]);
      return months === 1 ? '1 month' : `${months} months`;
    }
    return duration;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate('/jobseeker/find-internship')}
          className={styles.backButton}
        >
          Return to Internship Listings
        </button>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className={styles.errorContainer}>
        <h2>No job details available</h2>
        <button
          onClick={() => navigate('/jobseeker/find-internship')}
          className={styles.backButton}
        >
          Return to Internship Listings
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate('/jobseeker/find-internship')}>
        <FaArrowLeft /> Back to Listings
      </button>
      <div className={styles.jobHeader}>
        <div className={styles.basicInfo}>
          <h1 className={styles.jobTitle}><span className={styles.labelText}>Job Title: </span>{jobDetails.title}</h1>
          <h2 className={styles.companyName}><span className={styles.labelText}>Company Name: </span>{jobDetails.company}</h2>
          <div className={styles.badgeContainer}>
            <span className={styles.badge}>Internship</span>
            {jobDetails.tags && jobDetails.tags.length > 0 && (
              <span className={styles.badge}>{jobDetails.tags[0]}</span>
            )}
          </div>
        </div>
        <div className={styles.deadlineInfo}>
          <div className={styles.deadlineTimer}>
            <span className={styles.deadlineLabel}>Application Deadline</span>
            <span className={styles.deadlineDate}>{formattedDeadline || 'Not specified'}</span>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <div className={styles.quickInfoPanel}>
            <div className={styles.infoCard}>
              <FaMapMarkerAlt className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Location</span>
                <span className={styles.infoValue}>{jobDetails.location}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <FaGraduationCap className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Year of Study</span>
                <span className={styles.infoValue}>{jobDetails.yearOfStudy || 'Any year'}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <FaDollarSign className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Stipend</span>
                <span className={styles.infoValue}>${jobDetails.stipend}/month</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <FaClock className={styles.infoIcon} />
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Duration</span>
                <span className={styles.infoValue}>{formatDurationToMonths(jobDetails.duration)}</span>
              </div>
            </div>
          </div>

          <section className={styles.companySection}>
            <h3><FaBuilding className={styles.sectionIcon} /> About the Company</h3>
            <p className={styles.companyDescription}>{jobDetails.companyDescription || jobDetails.description}</p>
            <div className={styles.companyDetails}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Location:</span>
                <span className={styles.value}>{jobDetails.location}</span>
              </div>
              {jobDetails.area && (
                <div className={styles.detailItem}>
                  <span className={styles.label}>Area:</span>
                  <span className={styles.value}>{jobDetails.area}</span>
                </div>
              )}
            </div>
          </section>

          <section className={styles.jobDetailsSection}>
            <h3><FaBriefcase className={styles.sectionIcon} /> Job Description</h3>
            <p className={styles.description}>{jobDetails.description}</p>
            
            {jobDetails.jobScope && (
              <>
                <h3><FaBriefcase className={styles.sectionIcon} /> Job Scope</h3>
                <p className={styles.description}>{jobDetails.jobScope}</p>
              </>
            )}

            {/* Required Course of Study */}
            {jobDetails.courseStudy && jobDetails.courseStudy.length > 0 && (
              <>
                <h3><FaGraduationCap className={styles.sectionIcon} /> Required Course of Study</h3>
                <div className={styles.courseList}>
                  {jobDetails.courseStudy.map((course, index) => (
                    <span key={index} className={styles.courseBadge}>{course}</span>
                  ))}
                </div>
              </>
            )}

            {/* Fields of Study */}
            {jobDetails.fieldOfStudy && jobDetails.fieldOfStudy.length > 0 && (
              <>
                <h3><FaGraduationCap className={styles.sectionIcon} /> Fields of Study</h3>
                <div className={styles.fieldList}>
                  {jobDetails.fieldOfStudy.map((field, index) => (
                    <span key={index} className={styles.fieldBadge}>{field}</span>
                  ))}
                </div>
              </>
            )}
            
            {jobDetails.tags && jobDetails.tags.length > 0 && (
              <>
                <h3><FaBriefcase className={styles.sectionIcon} /> Skills Required</h3>
                <ul className={styles.skillsList}>
                  {jobDetails.tags.map((skill, index) => (
                    <li key={index} className={styles.skillTag}>{skill}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        <aside className={styles.applicationSidebar}>
          <div className={styles.applicationCard}>
            <h3>Application</h3>
            <div className={styles.applicationInfo}>
              <p className={styles.deadline}>
                <FaCalendarAlt className={styles.deadlineIcon} /> 
                Application closes on {formattedDeadline || 'Not specified'}
              </p>
              {jobDetails.applicants !== undefined && (
                <p className={styles.applicants}>
                  {jobDetails.applicants} {jobDetails.applicants === 1 ? 'person has' : 'people have'} applied
                </p>
              )}
            </div>
            
            <div className={styles.actionButtons}>
              {isApplied ? (
                <button className={styles.withdrawButton} onClick={handleWithdrawApplication}>
                  Withdraw Application
                </button>
              ) : (
                <button className={styles.applyButton} onClick={() => navigate(`/jobseeker/internship-application/${jobId}`)}>
                  Apply for Position
                </button>
              )}
              <button className={styles.messageButton} onClick={handleMessageEmployer}>
                <FaComment /> Message Employer
              </button>
              <button className={styles.shareButton} onClick={handleShareJob}>
                <FaShareAlt /> Share Job
              </button>
            </div>
          </div>
          
          {(latitude && longitude) ? (
            <div className={styles.minimapCard}>
              <h3>Location On Map</h3>
              <iframe
                src={`https://www.onemap.gov.sg/minimap/minimap.html?mapStyle=Default&zoomLevel=15&latLng=${latitude},${longitude}&ewt=JTNDcCUzRSUzQ3N0cm9uZyUzRSR7am9iRGV0YWlscy5jb21wYW55fSUzQyUyRnN0cm9uZyUzRSUyMCUzQ2JyJTIwJTJGJTNFJTNDYnIlMjAlMkYlM0Uke2pvYkRldGFpbHMubG9jYXRpb259JTNDYXI+JTNDJTJGcCUzRQ&popupWidth=200`}
                height="300"
                width="100%"
                scrolling="no"
                frameBorder="0"
                allowFullScreen="allowfullscreen"
                title="Location Map"
                className={styles.mapIframe}
              ></iframe>
            </div>
          ) : (
            <div className={styles.minimapCard}>
              <h3>Location On Map</h3>
              <p className={styles.mapPlaceholder}>Map loading...</p>
            </div>
          )}
        </aside>
      </div>

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

      {showFeatureMessage && (
        <div className={styles.featureMessageOverlay}>
          <div className={styles.featureMessage}>
            {featureMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default JS_InternshipDetailsPage;
