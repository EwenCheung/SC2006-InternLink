import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EP_AddInternshipPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const EP_AddInternshipPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    stipend: '',
    duration: '',
    courseStudy: '',
    yearOfStudy: '',
    tags: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'title', 
      'company', 
      'location', 
      'description', 
      'stipend', 
      'duration', 
      'courseStudy', 
      'yearOfStudy'
    ];
    
    const emptyFields = requiredFields.filter(field => !formData[field]);
    if (emptyFields.length > 0) {
      setError(`Please fill in the following fields: ${emptyFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const savePost = async (isDraft) => {
    try {
      setLoading(true);
      setError('');

      // Only validate if not a draft
      if (!isDraft && !validateForm()) {
        setLoading(false);
        return;
      }

      // Filter out empty fields for draft
      const postData = isDraft ? 
        Object.fromEntries(
          Object.entries(formData).filter(([_, value]) => 
            value !== '' && value !== null && (!Array.isArray(value) || value.length > 0)
          )
        ) : formData;

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/jobs/internship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...postData,
          status: isDraft ? 'draft' : 'posted'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create internship post');
      }

      navigate('/employer/post-internship');
    } catch (err) {
      setError(err.message || 'An error occurred while creating the post');
    } finally {
      setLoading(false);
    }
  };

  const handleDraft = (e) => {
    e.preventDefault();
    // Save as draft without validation
    savePost(true);
  };

  const handlePost = (e) => {
    e.preventDefault();
    // Save as post with validation
    savePost(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create Internship Post</h2>
      
      <form className={styles.form} onSubmit={handlePost}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Job Title</label>
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
          <label htmlFor="company">Company Name</label>
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
          <label htmlFor="location">Location</label>
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
          <label htmlFor="description">Job Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Describe the internship role and responsibilities"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="stipend">Stipend</label>
          <input
            type="text"
            id="stipend"
            name="stipend"
            value={formData.stipend}
            onChange={handleChange}
            placeholder="e.g. $1000/month"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="duration">Duration</label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g. 3 months"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="courseStudy">Required Course of Study</label>
          <input
            type="text"
            id="courseStudy"
            name="courseStudy"
            value={formData.courseStudy}
            onChange={handleChange}
            placeholder="e.g. Computer Science, Information Technology"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="yearOfStudy">Required Year of Study</label>
          <input
            type="text"
            id="yearOfStudy"
            name="yearOfStudy"
            value={formData.yearOfStudy}
            onChange={handleChange}
            placeholder="e.g. Year 2 and above"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags.join(', ')}
            onChange={handleTagsChange}
            placeholder="e.g. Programming, Data Science, Frontend"
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttonGroup}>
          <button 
            type="button" 
            onClick={handleDraft} 
            className={`${styles.button} ${styles.draftButton}`}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button 
            type="submit"
            className={`${styles.button} ${styles.postButton}`}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Internship'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EP_AddInternshipPage;
