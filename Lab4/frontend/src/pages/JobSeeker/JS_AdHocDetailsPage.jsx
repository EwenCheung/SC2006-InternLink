import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import styles from './JS_JobDetailsPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const JS_AdHocDetailsPage = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [jobDetails, setJobDetails] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFeatureMessage, setShowFeatureMessage] = useState(false);
  const [featureMessage, setFeatureMessage] = useState('');

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

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/adhoc/${jobId}`);
        const { data } = await response.json();
        if (response.ok && data) {
          setJobDetails(data);
        } else {
          setError(data.message || 'Failed to fetch job details');
        }
      } catch (err) {
        setError('An error occurred while fetching job details');
      } finally {
        setLoading(false);
      }
    };

    const fetchCoordinates = async (address) => {
      try {
        const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${address}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
        const tokenResponse = await fetch('http://localhost:5001/use-token');
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
          if (!latitude && !longitude) {
            setLatitude(fetchedLatitude);
            setLongitude(fetchedLongitude);
          }
        }
      } catch (err) {
        console.error('Error fetching coordinates:', err);
      }
    };

    fetchJobDetails().then(() => {
      if (jobDetails?.location && (!latitude || !longitude)) {
        fetchCoordinates(jobDetails.location);
      }
    });
  }, [jobId, jobDetails, latitude, longitude]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!jobDetails) {
    return <div>No job details available</div>;
  }

  return (
    <div>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => navigate('/jobseeker/find-adhoc')}>
          ← Back to Listings
        </button>
        <div className={styles.jobHeader}>
          <div className={styles.companyInfo}>
            <img src={jobDetails.companyLogo || '/images/Logo2.png'} alt="Company Logo" className={styles.companyLogo} />
            <div className={styles.basicInfo}>
              <h1 className={styles.jobTitle}>{jobDetails.title}</h1>
              <h2 className={styles.companyName}>{jobDetails.company}</h2>
              <div className={styles.quickInfo}>
                <span className={styles.location}>📍 {jobDetails.location}</span>
                <span className={styles.duration}>⏱️ {jobDetails.duration}</span>
                <span className={styles.year}>🎓 {jobDetails.yearOfStudy}</span>
                <span className={styles.salary}>💰 {jobDetails.stipend}/month</span>
              </div>
            </div>
          </div>
          <div className={styles.deadlineInfo}>
            <div className={styles.deadlineTimer}>
              <span className={styles.deadlineLabel}>Application Deadline</span>
              <span className={styles.deadlineDate}>{jobDetails.deadline}</span>
            </div>
          </div>
        </div>
        <div className={styles.contentWrapper}>
          <div className={styles.mainContent}>
            <section className={styles.companySection}>
              <h3>About the Company</h3>
              <p className={styles.companyDescription}>{jobDetails.companyDescription}</p>
              <div className={styles.companyDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.label}><h4>Location:</h4></span>
                  <span className={styles.value}>{jobDetails.location}</span>
                </div>
              </div>
            </section>
            <section className={styles.jobDetailsSection}>
              <h3>Job Description</h3>
              <p className={styles.description}>{jobDetails.description}</p>
              <h3>Skills Required</h3>
              <ul className={styles.skillsList}>
                {jobDetails.tags?.map((skill, index) => (
                  <li key={index} className={styles.skillTag}>{skill}</li>
                ))}
              </ul>
            </section>
          </div>
          <aside className={styles.applicationSidebar}>
            <div className={styles.applicationCard}>
              <h3>Apply Now</h3>
              <div className={styles.applicationInfo}>
                <p className={styles.deadline}>Application closes on {jobDetails.deadline}</p>
                <p className={styles.applicants}>{jobDetails.applicants} people have applied</p>
              </div>
              <div className={styles.actionButtons}>
                <button 
                  className={styles.applyButton}
                  onClick={() => navigate(`/jobseeker/adhoc-application/${jobId}`)}
                >
                  Apply for Position
                </button>
                <button 
                  className={styles.messageButton} 
                  onClick={handleMessageEmployer}
                >
                  Message Employer
                </button>
                <button 
                  className={styles.shareButton}
                  onClick={handleShareJob}
                >
                  Share Job
                </button>
              </div>
            </div>
            <div className={styles.minimapCard}>
              <h3>Location On Map</h3>
              <iframe
                src={`https://www.onemap.gov.sg/minimap/minimap.html?mapStyle=Default&zoomLevel=15&latLng=${latitude},${longitude}&ewt=JTNDcCUzRSUzQ3N0cm9uZyUzRVBsZWFzZSUyMGVudGVyJTIweW91ciUyMHRleHQlMjBpbiUyMHRoZSUyMGluJTIwdGhlJTIwUG9wdXAlMjBDcmVhdG9yLiUzQyUyRnN0cm9uZyUzRSUyMCUzQ2JyJTIwJTJGJTNFJTNDYnIlMjAlMkYlM0UlM0NpbWclMjBzcmMlM0QlMjIlMkZ3ZWItYXNzZXRzJTJGaW1hZ2VzJTJGbG9nbyUyRm9tX2xvZ29fMjU2LnBuZyUyMiUyMCUyRiUzRSUyMCUzQ2JyJTIwJTJGJTNFJTNDYnIlMjAlMkYlM0UlM0NhJTIwaHJlZiUzRCUyMiUyRiUyMiUzRU9uZU1hcCUzQyUyRmElM0UlM0MlMkZwJTNF&popupWidth=200`}
                height="300"
                width="300"
                scrolling="no"
                frameBorder="0"
                allowFullScreen="allowfullscreen"
                title="Location Map"
              ></iframe>
            </div>
          </aside>
        </div>
      </div>

      {showFeatureMessage && (
        <div className={styles.featureMessageOverlay}>
          <div className={styles.featureMessageDialog}>
            <p>{featureMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JS_AdHocDetailsPage;
