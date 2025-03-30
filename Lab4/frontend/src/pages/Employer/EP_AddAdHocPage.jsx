import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './EP_AddInternshipPage.module.css'; // Reusing the same styles
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const EP_AddAdHocPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [employerID, setEmployerID] = useState(null);
  const [isDraft, setIsDraft] = useState(false);
  const [draftID, setDraftID] = useState(null);
  const [currentTag, setCurrentTag] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    jobScope: '',
    payPerHour: '',
    tags: [],
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setEmployerID(userData._id);
      } catch (err) {
        console.error('Error parsing user data:', err);
        navigate('/employer/login');
      }
    } else {
      navigate('/employer/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Load draft data if editing a draft
    const loadDraft = async () => {
      const draftData = location.state?.draftData;
      if (draftData) {
        setIsDraft(true);
        setDraftID(draftData._id);
        setFormData({
          title: draftData.title || '',
          company: draftData.company || '',
          location: draftData.location || '',
          description: draftData.description || '',
          jobScope: draftData.jobScope || '',
          payPerHour: draftData.payPerHour || '',
          tags: draftData.tags || [],
        });
      }
    };

    loadDraft();
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'payPerHour') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handleTagInput = (e) => {
    setCurrentTag(e.target.value);
  };

  const addTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove)
    }));
  };

  const validateForm = () => {
    const missing = [];
    
    if (!formData.title) missing.push('Job Title');
    if (!formData.company) missing.push('Company Name');
    if (!formData.location) missing.push('Location');
    if (!formData.description) missing.push('Job Description');
    if (!formData.jobScope) missing.push('Job Scope');
    if (!formData.payPerHour) missing.push('Pay Per Hour');

    if (missing.length > 0) {
      setError(`Please fill in all required fields:\n${missing.join('\n')}`);
      return false;
    }

    const payNum = Number(formData.payPerHour);
    if (isNaN(payNum) || payNum < 0) {
      setError('Pay per hour must be a non-negative number');
      return false;
    }

    return true;
  };

  const handleBack = () => {
    if (
      formData.title ||
      formData.company ||
      formData.location ||
      formData.description ||
      formData.jobScope ||
      formData.payPerHour ||
      formData.tags.length > 0
    ) {
      setShowExitDialog(true);
    } else {
      navigate('/employer/post-adhoc');
    }
  };

  const handleExitWithoutSaving = () => {
    navigate('/employer/post-adhoc');
  };

  const handleSaveAsDraft = async () => {
    await savePost(true);
  };

  const savePost = async (isDraftSave) => {
    try {
      setLoading(true);
      setError('');

      if (!isDraftSave && !validateForm()) {
        setLoading(false);
        return;
      }

      if (!employerID) {
        setError('User not properly authenticated. Please log in again.');
        return;
      }

      const postData = {
        ...formData,
        employerID,
        type: 'adhoc_job',
        jobType: 'adhoc',
        status: isDraftSave ? 'draft' : 'posted'
      };

      // Convert pay per hour to number
      if (postData.payPerHour) {
        postData.payPerHour = Number(postData.payPerHour);
      }

      const token = localStorage.getItem('token');
      const endpoint = isDraftSave ? 'drafts' : 'adhoc';
      const method = (isDraft && isDraftSave) ? 'PUT' : 'POST';
      const url = `${API_BASE_URL}/api/jobs/${endpoint}${(isDraft && isDraftSave && draftID) ? `/${draftID}` : ''}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isDraftSave ? 
          'Failed to save draft' : 
          'Failed to publish ad-hoc job post. Please ensure all required fields are filled.'));
      }

      navigate('/employer/post-adhoc');
    } catch (err) {
      console.error('Error saving post:', err);
      setError(err.message || 'An error occurred while saving the post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          onClick={handleBack}
          className={styles.backButton}
        >
          <FaArrowLeft /> Back
        </button>
        <h2 className={styles.title}>
          {isDraft ? 'Edit Draft Ad-Hoc Job Post' : 'Create Ad-Hoc Job Post'}
        </h2>
      </div>
      
      {showExitDialog && (
        <div className={styles.dialog}>
          <div className={styles.dialogContent}>
            <h3>Save changes?</h3>
            <p>Do you want to save your changes as a draft before leaving?</p>
            <div className={styles.dialogButtons}>
              <button
                onClick={handleExitWithoutSaving}
                className={styles.exitButton}
              >
                Don't Save
              </button>
              <button
                onClick={handleSaveAsDraft}
                className={styles.saveButton}
              >
                Save as Draft
              </button>
              <button
                onClick={() => setShowExitDialog(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <h4>Please fix the following issues:</h4>
          {error.split('\n').map((err, index) => (
            <p key={index}>• {err}</p>
          ))}
        </div>
      )}

      <form className={styles.form} onSubmit={(e) => { e.preventDefault(); savePost(false); }}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Job Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Event Helper"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="company">Company Name*</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Your company name"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Location*</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Singapore"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Job Description*</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Overview of the position"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="jobScope">Job Scope*</label>
          <textarea
            id="jobScope"
            name="jobScope"
            value={formData.jobScope}
            onChange={handleChange}
            rows={5}
            placeholder="List the main responsibilities and tasks"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="payPerHour">Pay Per Hour (SGD)*</label>
          <input
            type="text"
            id="payPerHour"
            name="payPerHour"
            value={formData.payPerHour}
            onChange={handleChange}
            placeholder="e.g. 15"
            pattern="\d*"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tags">Tags (Press Enter or comma to add)</label>
          <div className={styles.tagInput}>
            {formData.tags.length > 0 && (
              <div className={styles.tagList}>
                {formData.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                    <button
                      type="button"
                      className={styles.deleteTag}
                      onClick={() => removeTag(index)}
                    >
                      <FaTimes />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              id="tags"
              value={currentTag}
              onChange={handleTagInput}
              onKeyDown={handleTagInputKeyDown}
              placeholder="e.g. Event Management, Customer Service"
            />
          </div>
        </div>

        <div className={styles.note}>
          * Required fields for publishing
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="button" 
            onClick={() => savePost(true)} 
            className={`${styles.button} ${styles.draftButton}`}
            disabled={loading}
          >
            {loading ? 'Saving...' : (isDraft ? 'Update Draft' : 'Save as Draft')}
          </button>
          <button 
            type="submit"
            className={`${styles.button} ${styles.postButton}`}
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EP_AddAdHocPage;
