import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COURSES_BY_CATEGORY, INDUSTRIES, YEAR_OF_STUDY_OPTIONS, DURATION_OPTIONS} from '../../constants/courses.js';
import CourseSelector from '../../components/Common/CourseSelector';
import styles from './EP_AddInternshipPage.module.css';


const EP_AddInternshipPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    industry: 'Select Industry',
    yearOfStudy: 'Select Year',
    courseStudy: [],
    duration: 'Select Duration',
    stipend: '',
    description: '',
    jobScope: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        return value.trim() === '' ? 'Please enter a job title' : '';
      case 'company':
        return value.trim() === '' ? 'Please enter a company name' : '';
      case 'location':
        return value.trim() === '' ? 'Please enter a location' : '';
      case 'industry':
        return value === 'Select Industry' ? 'Please select an industry' : '';
      case 'yearOfStudy':
        return value === 'Select Year' ? 'Please select a required year of study' : '';
      case 'courseStudy':
        return value.length === 0 ? 'Please select at least one course of study' : '';
      case 'duration':
        return value === 'Select Duration' ? 'Please select a duration' : '';
      case 'stipend':
        return !value || value < 0 ? 'Please enter a valid stipend amount' : '';
      case 'description':
        return value.trim() === '' ? 'Please enter a job description' : '';
      case 'jobScope':
        return value.trim() === '' ? 'Please enter a job scope' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCourseChange = (selectedCourses) => {
    setFormData(prev => ({
      ...prev,
      courseStudy: selectedCourses
    }));
    if (fieldErrors.courseStudy) {
      setFieldErrors(prev => ({
        ...prev,
        courseStudy: ''
      }));
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fill in all required fields correctly');
      return;
    }

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: 'internship_job',
          jobType: 'internship'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create job posting');
      }

      navigate('/employer/posts');
    } catch (err) {
      setError(err.message);
    }
  };

  const getInputClassName = (fieldName) => {
    return `${styles.input} ${fieldErrors[fieldName] ? styles.error : ''}`;
  };

  return (
    <div className={styles.container}>
      <h1>Add Internship Posting</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Job Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={getInputClassName('title')}
            required
          />
          {fieldErrors.title && <div className={styles.fieldError}>{fieldErrors.title}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="company">Company Name*</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className={getInputClassName('company')}
            required
          />
          {fieldErrors.company && <div className={styles.fieldError}>{fieldErrors.company}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Location*</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={getInputClassName('location')}
            required
          />
          {fieldErrors.location && <div className={styles.fieldError}>{fieldErrors.location}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="industry">Industry*</label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className={getInputClassName('industry')}
          >
            <option value="Select Industry">Select Industry</option>
            {INDUSTRIES.map(industry => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {fieldErrors.industry && <div className={styles.fieldError}>{fieldErrors.industry}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="yearOfStudy">Required Year of Study*</label>
          <select
            id="yearOfStudy"
            name="yearOfStudy"
            value={formData.yearOfStudy}
            onChange={handleChange}
            className={getInputClassName('yearOfStudy')}
          >
            {YEAR_OF_STUDY_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldErrors.yearOfStudy && <div className={styles.fieldError}>{fieldErrors.yearOfStudy}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="courseStudy">Required Course of Study*</label>
          <CourseSelector
            coursesByCategory={COURSES_BY_CATEGORY}
            selected={formData.courseStudy}
            onChange={handleCourseChange}
          />
          {fieldErrors.courseStudy && <div className={styles.fieldError}>{fieldErrors.courseStudy}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="duration">Duration*</label>
          <select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className={getInputClassName('duration')}
          >
            {DURATION_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldErrors.duration && <div className={styles.fieldError}>{fieldErrors.duration}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="stipend">Stipend (SGD)*</label>
          <input
            type="number"
            id="stipend"
            name="stipend"
            value={formData.stipend}
            onChange={handleChange}
            className={getInputClassName('stipend')}
            min="0"
            required
          />
          {fieldErrors.stipend && <div className={styles.fieldError}>{fieldErrors.stipend}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Job Description*</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={getInputClassName('description')}
            required
          />
          {fieldErrors.description && <div className={styles.fieldError}>{fieldErrors.description}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="jobScope">Job Scope*</label>
          <textarea
            id="jobScope"
            name="jobScope"
            value={formData.jobScope}
            onChange={handleChange}
            className={getInputClassName('jobScope')}
            required
          />
          {fieldErrors.jobScope && <div className={styles.fieldError}>{fieldErrors.jobScope}</div>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tags">Tags (Press Enter or comma to add)</label>
          <div className={styles.tagInput}>
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInput}
              placeholder="Add tags..."
            />
          </div>
          <div className={styles.tagList}>
            {formData.tags.map(tag => (
              <span key={tag} className={styles.tag}>
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className={styles.removeTag}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            Create Posting
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EP_AddInternshipPage;
