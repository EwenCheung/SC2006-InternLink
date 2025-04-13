import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styles from './EP_AddInternshipPage.module.css';
import { fetchSkillsData } from '../../../../backend/controllers/skillsdata.controller.js';
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
  const [employerID, setEmployerID] = useState(null);
  const [isDraft, setIsDraft] = useState(false);
  const [draftID, setDraftID] = useState(null);
  const [currentTag, setCurrentTag] = useState('');
  const [skillNames, setSkillNames] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // To handle loading state for address suggestions
  const [suggestions, setSuggestions] = useState([]); // To store address suggestions
  const [areaOptions, setAreaOptions] = useState([]); // To store area options

  // Add state for success message
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
    area: '',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 30 days from now
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
    const loadSkills = async () => {
      const skillNames = await fetchSkillsData();
      setSkillNames(skillNames);
    };
    loadSkills();
  }, []);

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
          area: draftData.area || '',
          jobScope: draftData.jobScope || '',
          applicationDeadline: draftData.applicationDeadline ? new Date(draftData.applicationDeadline).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
    };

    loadDraft();
  }, [location.state]);

  useEffect(() => {
    fetchAreaOptions();
  }, []);

  const fetchAreaOptions = async () => {
    const url = "https://www.onemap.gov.sg/api/public/popapi/getPlanningareaNames?year=2019";
    const tokenResponse = await fetch('http://localhost:5001/use-token'); // Fetch token from backend
    const tokenData = await tokenResponse.json();
    const authToken = tokenData.token; // Use the token from the response

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,  // API token for authorization
        },
      });

      const data = await response.json();
      if (data && Array.isArray(data)) {
        setAreaOptions(data.map(area => area.pln_area_n)); // Correctly map area names
      } else {
        console.error('Unexpected API response format:', data);
        setAreaOptions([]); // Clear options if response is invalid
      }
    } catch (error) {
      console.error('Error fetching area options:', error);
      setAreaOptions([]); // Clear options in case of an error
    }
  };

  const fetchAddressSuggestions = async (searchVal) => {
    setIsLoading(true);
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${searchVal}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
    const tokenResponse = await fetch('http://localhost:5001/use-token'); // Fetch token from backend
    const tokenData = await tokenResponse.json();
    const authToken = tokenData.token; // Use the token from the response

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `${authToken}`,
        },
      });

      const data = await response.json();

      if (data && data.results) {
        setSuggestions(data.results);  // Set the suggestions from the API response
      } else {
        setSuggestions([]);  // Clear suggestions if no results
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);  // Clear suggestions in case of an error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = (address) => {
    setFormData({
      ...formData,
      location: address, // Populate the input with the selected address
    });
    setSuggestions([]); // Clear suggestions after selection
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for applicationDeadline to prevent past dates
    if (name === 'applicationDeadline') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      
      if (selectedDate < today) {
        // If selected date is in the past, set to today instead
        setFormData({
          ...formData,
          [name]: new Date().toISOString().split('T')[0]
        });
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Trigger search only if location input is not empty
    if (name === 'location' && value.trim()) {
      fetchAddressSuggestions(value);
    } else if (name === 'location') {
      setSuggestions([]);  // Clear suggestions if location input is empty
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

  const handleSkillSelect = (skill) => {
    if (!formData.tags.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, skill]
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
    if (!formData.area) missing.push('Area');
    if (!formData.applicationDeadline) missing.push('Application Deadline');

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
      formData.tags.length > 0 ||
      formData.area
    ) {
      // Automatically save as draft and then navigate back
      savePost(true, true); // Pass true as second param to indicate back navigation after save
    } else {
      // If no data to save, just navigate back
      navigate('/employer/post-internship');
    }
  };

  const handleSaveAsDraft = async () => {
    await savePost(true);
  };

  const savePost = async (isDraftSave, isBackNavigation = false) => {
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

      // Make sure area, description, and jobScope are explicitly included
      const postData = {
        ...formData,
        area: formData.area || '',
        description: formData.description || '',
        jobScope: formData.jobScope || '',
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

      // If we're publishing from a draft, delete the draft
      if (!isDraftSave && isDraft && draftID) {
        try {
          console.log('Deleting draft after successful publication...');
          const deleteResponse = await fetch(`${API_BASE_URL}/api/jobs/drafts/${draftID}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (deleteResponse.ok) {
            console.log('Draft deleted successfully after publication');
          } else {
            console.error('Failed to delete draft after publication');
          }
        } catch (deleteError) {
          console.error('Error deleting draft after publication:', deleteError);
          // We still continue even if draft deletion fails
        }
      }

      // If navigating back after saving a draft, skip the success message
      if (isBackNavigation) {
        navigate('/employer/post-internship');
        return;
      }

      // Show success message using our custom message box instead of alert
      setSuccessMessage(isDraftSave ? 'Draft saved successfully!' : 'Internship published successfully!');
      setShowSuccessMessage(true);
      
      // Delay navigation slightly to ensure the user sees the success message
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate('/employer/post-internship');
      }, 2000);
    } catch (err) {
      console.error('Error saving post:', err);
      setError(err.message || 'An error occurred while saving the post');
      
      // If this was a back navigation, still navigate back even if save failed
      if (isBackNavigation) {
        navigate('/employer/post-internship');
      }
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
      
      {/* Success Message Box */}
      {showSuccessMessage && (
        <div className={styles.successMessageOverlay}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <h3>{successMessage}</h3>
            <p>Redirecting to dashboard...</p>
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

      <form className={styles.form} onSubmit={(e) => { 
        e.preventDefault();
        savePost(false); // This ensures we're publishing, not saving as draft
      }}>
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
          <label htmlFor="location">Address*</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Singapore"
            className={styles.inputBox}
            autoComplete="off" // Prevents browser autocomplete from interfering
          />
          {isLoading && <div className={styles.loadingText}>Searching addresses...</div>}
          
          {!isLoading && suggestions.length > 0 && (
            <div className={styles.suggestionsContainer}>
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className={styles.suggestionItem}
                  onClick={() => handleSuggestionSelect(suggestion.ADDRESS)}
                >
                  {suggestion.ADDRESS}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="area">Area*</label>
          <select
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            className={styles.suggestionsDropdown}
          >
            <option value="">Select an area</option>
            {areaOptions.map((area, index) => (
              <option key={index} value={area}>
                {area}
              </option>
            ))}
          </select>
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
          <label htmlFor="applicationDeadline">Application Deadline*</label>
          <input
            type="date"
            id="applicationDeadline"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]} // Can't select dates in the past
            className={styles.inputBox}
            onBlur={(e) => {
              // Additional check when field loses focus
              const selectedDate = new Date(e.target.value);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              if (selectedDate < today) {
                setFormData({
                  ...formData,
                  applicationDeadline: new Date().toISOString().split('T')[0]
                });
              }
            }}
          />
        </div>

        {/* Skills Input Section */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="skills" className={`${styles.label} ${styles.tagLabel}`}>
            Skills <span className={styles.optional}>(optional)</span>
          </label>
          
          <div className={styles.skillsContainer}>
            {formData.tags.map((skill, index) => (
              <div key={index} className={styles.skillTag}>
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className={styles.removeSkill}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.skillInputContainer}>
            <div className={styles.skillInputWrapper}>
              <input
                type="text"
                value={currentTag}
                onChange={handleTagInput}
                className={styles.formGroup}
                placeholder="Add a skill"
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault() && addTag()}
              />
              {currentTag.trim() !== '' && (
                <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded max-h-40 overflow-auto shadow">
                  {skillNames
                    .filter(
                      (skill) =>
                        skill.toLowerCase().includes(currentTag.toLowerCase()) &&
                        !formData.tags.includes(skill)
                    )
                    .slice(0, 50)
                    .map((skill, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSkillSelect(skill)}
                      >
                        {skill}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={addTag}
              className={`${styles.button} ${styles.secondaryButton} ${styles.addButton}`}
            >
              Add
            </button>
          </div>
        </div>

        <div className={styles.note}>
          * Required fields for publishing
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="button" 
            onClick={() => savePost(true)} 
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={loading}
          >
            {loading ? 'Saving...' : (isDraft ? 'Update Draft' : 'Save as Draft')}
          </button>
          <button 
            type="submit"
            className={`${styles.button} ${styles.secondaryButton}`}
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
