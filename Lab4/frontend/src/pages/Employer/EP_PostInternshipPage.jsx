import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EP_PostInternshipPage.module.css';
import { FaPlus, FaDollarSign, FaMapMarkerAlt, FaBuilding, FaCalendarAlt } from 'react-icons/fa';
import SuccessMessageBox from '../../components/Common/SuccessMessageBox';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const EP_PostInternshipPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add state for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Add state for confirmation dialogs
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmItemId, setConfirmItemId] = useState(null);
  const [confirmIsDraft, setConfirmIsDraft] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/jobs/internship/my-posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Fetched jobs:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch jobs');
      }

      setJobs(data.data.jobs || []);
      setDrafts(data.data.drafts || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDraft = (draft) => {
    navigate('/employer/add-internship', { 
      state: { draftData: draft }
    });
  };

  // New method to show confirmation dialog
  const showConfirmationDialog = (title, message, action, id, isDraft = false) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(action);
    setConfirmItemId(id);
    setConfirmIsDraft(isDraft);
    setShowConfirmDialog(true);
  };

  // Handle the confirmation result
  const handleConfirmAction = async () => {
    setShowConfirmDialog(false);
    
    if (confirmAction === 'delete') {
      await performDelete(confirmItemId, confirmIsDraft);
    } else if (confirmAction === 'publish') {
      await performPublish(confirmItemId);
    }
  };

  // Extract delete logic to a separate function
  const performDelete = async (id, isDraft) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isDraft ? 'drafts' : 'internship';
      
      const response = await fetch(`${API_BASE_URL}/api/jobs/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete job');
      }

      // Show success message
      setSuccessMessage(`${isDraft ? 'Draft' : 'Job Posting'} deleted successfully!`);
      setShowSuccessMessage(true);

      // Set a timer to hide the message after 2 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Refresh the jobs list
        fetchJobs();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error deleting job');
    }
  };

  // Extract publish logic to a separate function
  const performPublish = async (draftId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/jobs/drafts/${draftId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to publish draft. Please ensure all required fields are filled.');
      }

      // Show success message
      setSuccessMessage('Draft published successfully!');
      setShowSuccessMessage(true);

      // Set a timer to hide the message after 2 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Refresh the jobs list
        fetchJobs();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error publishing draft');
    }
  };

  // Update the handler methods to use our confirmation dialog
  const handleDelete = (id, isDraft = false) => {
    showConfirmationDialog(
      'Confirm Deletion',
      `Are you sure you want to delete this ${isDraft ? 'draft' : 'job post'}?`,
      'delete',
      id,
      isDraft
    );
  };

  const handleEditPost = (id) => {
    navigate(`/employer/edit-internship/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/employer/internship-details/${id}`);
  };

  const handlePublishDraft = (draftId) => {
    showConfirmationDialog(
      'Confirm Publication',
      'Are you sure you want to publish this draft? Once published, it will be visible to job seekers.',
      'publish',
      draftId
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your posts...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Internship Posts</h1>
        <button
          onClick={() => navigate('/employer/add-internship')}
          className={styles.addButton}
        >
          <FaPlus /> Add New Internship
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className={styles.dialogOverlay}>
          <div className={styles.dialogBox}>
            <h3>{confirmTitle}</h3>
            <p>{confirmMessage}</p>
            <div className={styles.dialogButtons}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button 
                className={`${confirmAction === 'delete' ? styles.deleteButton : styles.viewButton}`}
                onClick={handleConfirmAction}
              >
                {confirmAction === 'delete' ? 'Delete' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Box */}
      <SuccessMessageBox 
        show={showSuccessMessage}
        message={successMessage}
        onClose={() => setShowSuccessMessage(false)}
      />

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.jobList}>
        {drafts.length > 0 && (
          <>
            <h2 className={styles.draftsHeader}>Drafts</h2>
            <div className={styles.jobGrid}>
              {drafts.map(draft => (
                <div key={draft._id} className={`${styles.jobCard} ${styles.draftCard}`}>
                  <div className={styles.draftBadge}>Draft</div>
                  <div className={styles.jobDetails}>
                    <h3>{draft.title || 'Untitled Draft'}</h3>
                    {draft.company && (
                      <p><FaBuilding /> {draft.company}</p>
                    )}
                    {draft.location && (
                      <p><FaMapMarkerAlt /> {draft.location}</p>
                    )}
                    {draft.stipend && (
                      <p className={styles.stipendInfo}>
                        <FaDollarSign /> SGD {draft.stipend}/month
                      </p>
                    )}
                    <p><FaCalendarAlt /> Last modified: {new Date(draft.lastModified).toLocaleDateString()}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => handleEditDraft(draft)}
                      className={styles.editButton}
                    >
                      Edit Draft
                    </button>
                    <button
                      onClick={() => handlePublishDraft(draft._id)}
                      className={styles.viewButton}
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => handleDelete(draft._id, true)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className={styles.publishedHeader}>Published Posts</h2>
        {jobs.length === 0 ? (
          <p className={styles.noJobs}>No published internship posts yet.</p>
        ) : (
          <div className={styles.jobGrid}>
            {jobs.map(job => (
              <div key={job._id} className={styles.jobCard}>
                <div className={styles.publishedBadge}>Published</div>
                <div className={styles.jobDetails}>
                  <h3>{job.title}</h3>
                  <p><FaBuilding /> {job.company}</p>
                  <p><FaMapMarkerAlt /> {job.location}</p>
                  <p className={styles.stipendInfo}>
                    <FaDollarSign /> SGD {job.stipend}/month
                  </p>
                  {job.tags?.length > 0 && (
                    <div className={styles.tagList}>
                      {job.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <p><FaCalendarAlt /> Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleViewDetails(job._id)}
                    className={styles.viewButton}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EP_PostInternshipPage;
