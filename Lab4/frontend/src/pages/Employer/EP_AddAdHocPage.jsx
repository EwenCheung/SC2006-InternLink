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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [skillNames, setSkillNames] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    jobScope: '',
    payPerHour: '',
    tags: [],
    area: '',
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
    
    // Load skills for tag suggestions
    const loadSkills = async () => {
      const skillNames = await fetchSkillsData();
      setSkillNames(skillNames);
    };
    loadSkills();
  }, [navigate]);

  useEffect(() => {
    fetchAreaOptions();
  }, []);

  // Function to fetch area options from OneMap API
  const fetchAreaOptions = async () => {
    const url = "https://www.onemap.gov.sg/api/public/popapi/getPlanningareaNames?year=2019";
    
    try {
      const tokenResponse = await fetch(`${API_BASE_URL}/use-token`);
      const tokenData = await tokenResponse.json();
      const authToken = tokenData.token;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `${authToken}`,
        },
      });

      const data = await response.json();
      if (data && Array.isArray(data)) {
        setAreaOptions(data.map(area => area.pln_area_n));
      } else {
        console.error('Unexpected API response format:', data);
        setAreaOptions([]);
      }
    } catch (error) {
      console.error('Error fetching area options:', error);
      setAreaOptions([]);
    }
  };

  useEffect(() => {
    // Load draft data if editing a draft
    const loadDraft = async () => {
      const draftData = location.state?.draftData;
      if (draftData) {
        // Check if the post is published (not a draft) and redirect
        if (draftData.status === 'posted') {
          navigate('/employer/post-adhoc');
          return;
        }
        
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
          area: draftData.area || '',
          jobType: 'adhoc'
        });
      }
    };

    loadDraft();
  }, [location.state, navigate]);

  const fetchAddressSuggestions = async (searchVal) => {
    setIsLoading(true);
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${searchVal}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
    
    try {
      const tokenResponse = await fetch(`${API_BASE_URL}/use-token`);
      const tokenData = await tokenResponse.json();
      const authToken = tokenData.token;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `${authToken}`,
        },
      });

      const data = await response.json();

      if (data && data.results) {
        setSuggestions(data.results);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSkillsData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/skills`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  };

  const handleSuggestionSelect = (address) => {
    setFormData({
      ...formData,
      location: address,
    });
    setSuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'payPerHour') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Trigger address suggestion search for location input
      if (name === 'location' && value.trim()) {
        fetchAddressSuggestions(value);
      } else if (name === 'location') {
        setSuggestions([]);
      }
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
      
      // Use the same draft routes as internship page
      let url, method;
      
      if (isDraftSave) {
        // For draft saving/updating
        if (isDraft && draftID) {
          url = `${API_BASE_URL}/api/jobs/drafts/${draftID}`;
          method = 'PUT';
        } else {
          url = `${API_BASE_URL}/api/jobs/adhoc/drafts`;
          method = 'POST';
        }
      } else {
        // For publishing
        url = `${API_BASE_URL}/api/jobs/adhoc`;
        method = 'POST';
      }

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
        }
      }

      // Show success message
      setSuccessMessage(isDraftSave ? 'Draft saved successfully!' : 'Ad-hoc job published successfully!');
      setShowSuccessMessage(true);
      
      // Delay navigation to ensure the user sees the success message
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate('/employer/post-adhoc');
      }, 2000);
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
            className={styles.inputBox}
          />
          {isLoading && <div>Loading...</div>}
          {suggestions.length > 1 && (
            <select
              className={styles.suggestionsDropdown}
              onChange={(e) => handleSuggestionSelect(e.target.value)}
              size={suggestions.length > 5 ? 5 : suggestions.length} // Limit visible options
            >
              {suggestions.map((suggestion, index) => (
                <option key={index} value={suggestion.ADDRESS}>
                  {suggestion.ADDRESS}
                </option>
              ))}
            </select>
          )}
          {suggestions.length === 1 && (
            <div
              className={styles.singleSuggestion}
              onClick={() => handleSuggestionSelect(suggestions[0].ADDRESS)}
            >
              {suggestions[0].ADDRESS}
            </div>
          )}
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
          <label htmlFor="area">Area</label>
          <select
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
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
          <label htmlFor="tags">Skills Required (Press Enter or comma to add)</label>
          <div className={`${styles.skillsContainer} flex flex-wrap gap-2`}>
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

          <div className="flex items-start gap-2 mt-2 relative items-center">
            <div className={`${styles.tagInput} w-full relative`}>
              <input
                type="text"
                value={currentTag}
                onChange={handleTagInput}
                className={`${styles.formGroup}`}
                placeholder="Add a skill"
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
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
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, skill]
                          }));
                          setCurrentTag('');
                        }}
                      >
                        {skill}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div className="gap-2 flex items-center">
              <button
                type="button"
                onClick={addTag}
                className={`${styles.button} ${styles.secondaryButton}`}
              >
                Add
              </button>
            </div>
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
            {loading ? 'Publishing...' : 'Publish Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EP_AddAdHocPage;
