import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './EP_InternshipDetailsPage.module.css'; // Reuse the same styles
import { FaArrowLeft, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, 
  FaGraduationCap, FaSearch, FaFilter, FaUser, FaUniversity, FaClock, FaFilePdf, FaExternalLinkAlt } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Define the getStatusClass function to return appropriate CSS class based on status
const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'accepted':
      return styles.statusAccepted;
    case 'rejected':
      return styles.statusRejected;
    case 'pending':
      return styles.statusPending;
    default:
      return styles.statusPending;
  }
};

const EP_AdHocDetailsPage = () => {
  const navigate = useNavigate();
  const { id:jobId } = useParams();
  const [jobDetails, setJobDetails] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [formattedDeadline, setFormattedDeadline] = useState('');
  const [resumePreviewUrl, setResumePreviewUrl] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/api/jobs/adhoc/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch job details: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.data.applicationDeadline) {
          const deadlineDate = new Date(data.data.applicationDeadline);
          setFormattedDeadline(deadlineDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));
        }
        
        setJobDetails(data.data);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Fetching applicants for job ID:', jobId);
      
      // Use the correct route based on the updated API endpoint
      const applicationsResponse = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!applicationsResponse.ok) {
        throw new Error(`Failed to fetch applications: ${applicationsResponse.status}`);
      }

      const responseData = await applicationsResponse.json();
      console.log('Applications data received:', responseData);
      
      if (!responseData.success || !responseData.data) {
        console.warn('No applicants data found');
        setApplicants([]);
        return;
      }
      
      // Extract applications and jobseekerIds from the response
      const { applications } = responseData.data;
      
      if (!applications || applications.length === 0) {
        setApplicants([]);
        return;
      }
      
      // Now fetch details for each applicant
      const applicantsData = await Promise.all(
        applications.map(async (application) => {
          try {
            const jobseekerId = application.jobSeeker;
            
            if (!jobseekerId) {
              console.warn(`No jobseeker ID found for application ${application._id}`);
              return null;
            }
            
            // Get application details first - this has the resume data
            const applicationResponse = await fetch(`${API_BASE_URL}/api/applications/${application._id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!applicationResponse.ok) {
              console.warn(`Failed to fetch application details for ID ${application._id}: ${applicationResponse.status}`);
            }
            
            let applicationDetails = null;
            try {
              const appData = await applicationResponse.json();
              if (appData.success && appData.data) {
                applicationDetails = appData.data;
                console.log('Application details retrieved:', application._id, 
                  applicationDetails.resume ? 'Has resume' : 'No resume');
              }
            } catch (appError) {
              console.error('Error parsing application data:', appError);
            }
            
            // Use the getJobSeekerProfile endpoint
            const userResponse = await fetch(`${API_BASE_URL}/api/auth/jobseeker/${jobseekerId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!userResponse.ok) {
              console.warn(`Failed to fetch user details for ID ${jobseekerId}: ${userResponse.status}`);
              return null;
            }
            
            const userData = await userResponse.json();
            
            if (!userData.success || !userData.data) {
              console.warn(`Invalid user data received for ID ${jobseekerId}`);
              return null;
            }
            
            // Construct applicant object combining user profile and application data (including resume)
            return {
              id: application._id,
              applicationId: application._id,
              jobseekerId: jobseekerId,
              applicantName: userData.data.userName || 'Unknown',
              applicantEmail: userData.data.email || 'No email provided',
              school: userData.data.school || 'Not specified',
              yearOfStudy: userData.data.yearOfStudy || 'Not specified',
              course: userData.data.course || 'Not specified',
              status: application.status || 'Pending',
              appliedDate: application.appliedDate || application.createdAt || new Date().toISOString(),
              // Get resume from the application document, not the user profile
              resumeData: applicationDetails?.resume || null,
              profileImage: userData.data.profileImage?.url || null,
              // Include the full application data for reference
              applicationDetails: applicationDetails
            };
          } catch (userError) {
            console.error(`Error fetching user details:`, userError);
            return null;
          }
        })
      );
      
      // Filter out any null values (failed fetches)
      const validApplicants = applicantsData.filter(app => app !== null);
      console.log(`Successfully loaded ${validApplicants.length} of ${applications.length} applicants`);
      
      setApplicants(validApplicants);
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplicantDetails = async (applicant) => {
    setSelectedApplicant(applicant);
    
    // If there's resume data in the application
    if (applicant.resumeData) {
      try {
        console.log('Resume data found in application:', applicant.resumeData);
        
        // If we have direct access to resume data in the application
        if (applicant.resumeData.data) {
          try {
            // Create a blob from the base64 data
            const binaryString = atob(applicant.resumeData.data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Create a blob and object URL for display
            const blob = new Blob([bytes.buffer], { type: applicant.resumeData.type || 'application/pdf' });
            const previewUrl = URL.createObjectURL(blob);
            setResumePreviewUrl(previewUrl);
            console.log('Resume blob created from binary data');
          } catch (error) {
            console.error('Error processing resume binary data:', error);
            setResumePreviewUrl(null);
          }
        }
        // If we need to fetch the resume data from the API
        else {
          const token = localStorage.getItem('token');
          const resumeEndpoint = `${API_BASE_URL}/api/applications/${applicant.id}/resume`;
            
          console.log('Fetching resume from endpoint:', resumeEndpoint);
          
          const resumeResponse = await fetch(resumeEndpoint, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (resumeResponse.ok) {
            const blob = await resumeResponse.blob();
            const previewUrl = URL.createObjectURL(blob);
            setResumePreviewUrl(previewUrl);
            console.log('Resume fetched successfully from API');
          } else {
            console.error('Failed to fetch resume:', resumeResponse.status);
            setResumePreviewUrl(null);
          }
        }
      } catch (error) {
        console.error('Error handling resume:', error);
        setResumePreviewUrl(null);
      }
    } else {
      console.log('No resume data available for this applicant');
      setResumePreviewUrl(null);
    }
  };

  const handleCloseApplicantDetails = () => {
    setSelectedApplicant(null);
    // Clean up URL object
    if (resumePreviewUrl) {
      URL.revokeObjectURL(resumePreviewUrl);
      setResumePreviewUrl(null);
    }
  };

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      // Find the applicant to get the jobSeekerId
      const applicant = applicants.find(app => app.id === applicantId);
      if (!applicant) {
        throw new Error('Applicant not found');
      }
      
      console.log('Updating application status with data:', {
        status: newStatus,
        jobId: jobId,
        jobSeekerId: applicant.jobseekerId
      });
      
      // Make API call to update the application status with both jobId and jobSeekerId
      const response = await fetch(`${API_BASE_URL}/api/jobs/application/update-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          jobId: jobId,
          jobSeekerId: applicant.jobseekerId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        throw new Error(`Failed to update application status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update the local state to reflect the change
        setApplicants(apps => 
          apps.map(app => 
            app.id === applicantId ? {...app, status: newStatus} : app
          )
        );
        
        // If we're showing the application detail view, update the selected applicant too
        if (selectedApplicant && selectedApplicant.id === applicantId) {
          setSelectedApplicant(prev => ({...prev, status: newStatus}));
        }
        
        // Close any open status dialog
        setShowStatusDialog(false);
      } else {
        // Handle error case
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleEditAdhoc = () => {
    navigate(`/employer/edit-adhoc/${jobId}`);
  };

  // Add filteredApplicants as a derived state 
  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = 
      app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.applicantEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.school?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || app.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/employer/post-adhoc')}
          className={styles.returnButton}
        >
          Return to Ad-Hoc Posts
        </button>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className={styles.errorContainer}>
        <h2>Ad-Hoc job not found</h2>
        <button 
          onClick={() => navigate('/employer/post-adhoc')}
          className={styles.returnButton}
        >
          Return to Ad-Hoc Posts
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => navigate('/employer/post-adhoc')}
          className={styles.backButton}
        >
          <FaArrowLeft /> Back to Ad-Hoc Posts
        </button>
      </div>

      <div className={styles.jobDetailsSection}>
        <h1 className={styles.jobTitle}>{jobDetails.title}</h1>
        
        <div className={styles.jobSummary}>
          <div className={styles.jobInfo}>
            <div className={styles.infoItem}>
              <FaBuilding className={styles.infoIcon} />
              <span>{jobDetails.company}</span>
            </div>
            <div className={styles.infoItem}>
              <FaMapMarkerAlt className={styles.infoIcon} />
              <span>{jobDetails.location}</span>
            </div>
            <div className={styles.infoItem}>
              <FaDollarSign className={styles.infoIcon} />
              <span>SGD {jobDetails.payPerHour}/hour</span>
            </div>
            {jobDetails.duration && (
              <div className={styles.infoItem}>
                <FaCalendarAlt className={styles.infoIcon} />
                <span>{jobDetails.duration}</span>
              </div>
            )}
            {jobDetails.yearOfStudy && (
              <div className={styles.infoItem}>
                <FaGraduationCap className={styles.infoIcon} />
                <span>{jobDetails.yearOfStudy}</span>
              </div>
            )}
          </div>
          
          <div className={styles.statsBox}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Views</span>
              <span className={styles.statValue}>{jobDetails.views || 0}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Applicants</span>
              <span className={styles.statValue}>{applicants.length}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Posted on</span>
              <span className={styles.statValue}>{new Date(jobDetails.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.jobContent}>
          <div className={styles.jobDescription}>
            <h2>Job Description</h2>
            <p>{jobDetails.description}</p>
          </div>
          
          {jobDetails.jobScope && (
            <div className={styles.jobScope}>
              <h2>Job Scope</h2>
              <p>{jobDetails.jobScope}</p>
            </div>
          )}
          
          {jobDetails.tags && jobDetails.tags.length > 0 && (
            <div className={styles.jobSkills}>
              <h2>Required Skills</h2>
              <div className={styles.skillsList}>
                {jobDetails.tags.map((tag, index) => (
                  <span key={index} className={styles.skillTag}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.jobDeadline}>
            <h2>Application Deadline</h2>
            <p>{formattedDeadline || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className={styles.applicantsSection}>
        <h2>Applicants</h2>
        
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search applicants..."
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

        {filteredApplicants.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No applicants match your search</h3>
            {applicants.length > 0 ? (
              <p>Try changing your search or filter criteria</p>
            ) : (
              <p>No one has applied to this position yet</p>
            )}
            {searchTerm || filterStatus !== 'all' ? (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className={styles.resetButton}
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className={styles.applicantsGrid}>
            {filteredApplicants.map((applicant) => (
              <div key={applicant.id} className={styles.applicantCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.applicantInfo}>
                    <h3 className={styles.applicantName}>{applicant.applicantName}</h3>
                    <span className={`${styles.statusBadge} ${getStatusClass(applicant.status)}`}>
                      {applicant.status}
                    </span>
                  </div>
                  <p className={styles.applicantSchool}>
                    <FaUniversity className={styles.infoIcon} />
                    {applicant.school || 'N/A'}
                  </p>
                </div>
                
                <div className={styles.applicationDetails}>
                  <div className={styles.detailItem}>
                    <FaUser className={styles.infoIcon} />
                    <span>{applicant.applicantEmail}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <FaClock className={styles.infoIcon} />
                    <span>Applied: {new Date(applicant.appliedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className={styles.cardActions}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewApplicantDetails(applicant)}
                  >
                    View Details
                  </button>
                  <button 
                    className={styles.statusButton}
                    onClick={() => setShowStatusDialog(applicant.id)}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedApplicant && (
        <div className={styles.applicantDetailsOverlay}>
          <div className={styles.applicantDetailsContainer}>
            <div className={styles.detailsHeader}>
              <h2>Applicant Details</h2>
              <button 
                className={styles.closeButton}
                onClick={handleCloseApplicantDetails}
              >
                ×
              </button>
            </div>
            
            <div className={styles.applicantDetailsContent}>
              <div className={styles.personalInfo}>
                <h3>Personal Information</h3>
                <p><strong>Name:</strong> {selectedApplicant.applicantName}</p>
                <p><strong>Email:</strong> {selectedApplicant.applicantEmail}</p>
                <p><strong>School:</strong> {selectedApplicant.school || 'N/A'}</p>
                <p><strong>Year of Study:</strong> {selectedApplicant.yearOfStudy || 'N/A'}</p>
                <p><strong>Course:</strong> {selectedApplicant.course || 'N/A'}</p>
              </div>
              
              <div className={styles.applicationInfo}>
                <h3>Application Information</h3>
                <p><strong>Status:</strong> <span className={`${styles.statusLabel} ${getStatusClass(selectedApplicant.status)}`}>{selectedApplicant.status}</span></p>
                <p><strong>Applied Date:</strong> {new Date(selectedApplicant.appliedDate).toLocaleDateString()}</p>
                
                {/* PDF Resume Section */}
                <div className={styles.resumeSection}>
                  <h3>Resume</h3>
                  
                  {resumePreviewUrl ? (
                    <div className={styles.pdfContainer}>
                      <div className={styles.pdfHeader}>
                        <h4>{selectedApplicant.applicantName}'s Resume</h4>
                        <a 
                          href={resumePreviewUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.fullScreenButton}
                        >
                          <FaExternalLinkAlt /> Open Full Screen
                        </a>
                      </div>
                      <iframe 
                        src={resumePreviewUrl} 
                        className={styles.resumePreview} 
                        title="Resume Preview"
                        frameBorder="0"
                      ></iframe>
                    </div>
                  ) : (
                    <div className={styles.noResume}>
                      <FaFilePdf className={styles.noPdfIcon} />
                      <p>No resume available for this applicant</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.detailsActions}>
              <button 
                className={`${styles.statusActionButton} ${styles.acceptButton}`}
                onClick={() => handleStatusChange(selectedApplicant.id, 'Accepted')}
              >
                Accept
              </button>
              <button 
                className={`${styles.statusActionButton} ${styles.rejectButton}`}
                onClick={() => handleStatusChange(selectedApplicant.id, 'Rejected')}
              >
                Reject
              </button>
              <button 
                className={styles.messageButton}
                onClick={() => {/* Handle messaging */}}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusDialog && (
        <div className={styles.statusDialogOverlay}>
          <div className={styles.statusDialogContainer}>
            <h3>Change Application Status</h3>
            <div className={styles.statusOptions}>
              <button 
                className={`${styles.statusOption} ${styles.pendingOption}`}
                onClick={() => handleStatusChange(showStatusDialog, 'Pending')}
              >
                Pending
              </button>
              <button 
                className={`${styles.statusOption} ${styles.acceptOption}`}
                onClick={() => handleStatusChange(showStatusDialog, 'Accepted')}
              >
                Accept
              </button>
              <button 
                className={`${styles.statusOption} ${styles.rejectOption}`}
                onClick={() => handleStatusChange(showStatusDialog, 'Rejected')}
              >
                Reject
              </button>
            </div>
            <button 
              className={styles.cancelButton}
              onClick={() => setShowStatusDialog(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EP_AdHocDetailsPage;