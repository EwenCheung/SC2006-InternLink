import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from './EP_AddInternshipPage.module.css';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const DURATION_OPTIONS = [
  'Select Duration',
  '1 month',
  '2 months',
  '3 months',
  '4 months',
  '5 months',
  '6 months',
  '8 months',
  '12 months'
];

const YEAR_OF_STUDY_OPTIONS = [
  'Select Year',
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Any Year'
];

const COURSE_OPTIONS = [
  'Select Course',
  'Computer Science',
  'Information Technology',
  'Software Engineering',
  'Business Analytics',
  'Information Systems',
  'Computer Engineering',
  'Any Related Field'
];

const EP_AddInternshipPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [employerID, setEmployerID] = useState(null);
  const { draftId } = useParams();
  const [isDraft, setIsDraft] = useState(false);
  const [draftID, setDraftID] = useState(null);
  const [currentTag, setCurrentTag] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    jobScope: '',
    stipend: '',
    duration: 'Select Duration',
    courseStudy: 'Select Course',
    yearOfStudy: 'Select Year',
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
          stipend: draftData.stipend || '',
          duration: draftData.duration || 'Select Duration',
          courseStudy: draftData.courseStudy || 'Select Course',
          yearOfStudy: draftData.yearOfStudy || 'Select Year',
          tags: draftData.tags || [],
        });
      }
    };

    loadDraft();
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'stipend') {
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
    if (!formData.stipend) missing.push('Monthly Stipend');
    if (formData.duration === 'Select Duration') missing.push('Duration');
    if (formData.courseStudy === 'Select Course') missing.push('Course of Study');
    if (formData.yearOfStudy === 'Select Year') missing.push('Year of Study');

    if (missing.length > 0) {
      setError(`Please fill in all required fields:\n${missing.join('\n')}`);
      return false;
    }

    const stipendNum = Number(formData.stipend);
    if (isNaN(stipendNum) || stipendNum < 0) {
      setError('Stipend must be a non-negative number');
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
      formData.stipend ||
      formData.duration !== 'Select Duration' ||
      formData.courseStudy !== 'Select Course' ||
      formData.yearOfStudy !== 'Select Year' ||
      formData.tags.length > 0
    ) {
      setShowExitDialog(true);
    } else {
      navigate('/employer/post-internship');
    }
  };

  const handleExitWithoutSaving = () => {
    navigate('/employer/post-internship');
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
        type: 'internship_job',
        jobType: 'internship',
        status: isDraftSave ? 'draft' : 'posted'
      };

      // Convert stipend to number if it exists
      if (postData.stipend) {
        postData.stipend = Number(postData.stipend);
      }

      const token = localStorage.getItem('token');
      const endpoint = isDraftSave ? 'drafts' : 'internship';
      const method = (isDraft && isDraftSave) ? 'PUT' : 'POST';
      const url = `${API_BASE_URL}/api/jobs/${endpoint}${(isDraft && isDraftSave && draftID) ? `/${draftID}` : ''}`;

      console.log('Saving:', { isDraftSave, method, url, postData });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(data.message || (isDraftSave ? 
          'Failed to save draft' : 
          'Failed to publish internship post. Please ensure all required fields are filled.'));
      }

      navigate('/employer/post-internship');
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
          {isDraft ? 'Edit Draft Internship Post' : 'Create Internship Post'}
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
            placeholder="e.g. Software Engineering Intern"
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
            placeholder="Overview of the internship position"
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
          <label htmlFor="stipend">Monthly Stipend (SGD)*</label>
          <input
            type="text"
            id="stipend"
            name="stipend"
            value={formData.stipend}
            onChange={handleChange}
            placeholder="e.g. 1000"
            pattern="\d*"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="duration">Duration*</label>
          <select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
          >
            {DURATION_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="courseStudy">Required Course of Study*</label>
          <select
            id="courseStudy"
            name="courseStudy"
            value={formData.courseStudy}
            onChange={handleChange}
          >
            {COURSE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="yearOfStudy">Required Year of Study*</label>
          <select
            id="yearOfStudy"
            name="yearOfStudy"
            value={formData.yearOfStudy}
            onChange={handleChange}
          >
            {YEAR_OF_STUDY_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
              placeholder="e.g. Programming, Data Science, Frontend"
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
            {loading ? 'Publishing...' : 'Publish Internship'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EP_AddInternshipPage;
