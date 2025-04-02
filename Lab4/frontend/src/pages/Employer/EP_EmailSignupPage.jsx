import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../JobSeeker/JS_EmailSignupPage.module.css';
import internshipStyles from './EP_AddInternshipPage.module.css';
import { FaGoogle, FaGithub, FaArrowLeft, FaTimes } from 'react-icons/fa';

const ProfileCompletionModal = ({ onFillNow, onFillLater }) => (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <h3 className={styles.modalTitle}>Complete Your Profile</h3>
      <p className={styles.modalText}>
        Would you like to complete your profile now? Adding more details helps attract better candidates.
      </p>
      <div className={styles.modalButtons}>
        <button
          onClick={onFillLater}
          className={`${styles.button} ${styles.secondaryButton}`}
        >
          Fill Later
        </button>
        <button
          onClick={onFillNow}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          Complete Now
        </button>
      </div>
    </div>
  </div>
);

const EP_EmailSignupPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Form data for required fields (Step 1)
  const [requiredData, setRequiredData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Track touched fields and errors
  const [touchedFields, setTouchedFields] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  // Password requirements state
  const [passwordReqs, setPasswordReqs] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Form data for optional fields (Step 2)
  const [optionalData, setOptionalData] = useState({
    companyName: '',
    profileImage: null, // Company logo
    phoneNumber: '',
    industry: '',
    companySize: '',
    companyWebsite: '',
    companyDescription: '',
    address: '',
  });

  // Password validation
  const validatePassword = (password) => {
    const reqs = {
      length: password.length >= 6 && password.length <= 50,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    setPasswordReqs(reqs);
    return Object.values(reqs).every(req => req);
  };

  // Field validation
  const validateField = (name, value) => {
    switch (name) {
      case 'userName':
        return value ? '' : 'Name is required';
      case 'email':
        return /\S+@\S+\.\S+/.test(value) ? '' : 'Valid email is required';
      case 'password':
        return validatePassword(value) ? '' : 'Password does not meet requirements';
      case 'confirmPassword':
        return value === requiredData.password ? '' : 'Passwords do not match';
      default:
        return '';
    }
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Validate required fields
  const validateRequiredFields = () => {
    setTouchedFields({
      userName: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    const newErrors = {
      userName: validateField('userName', requiredData.userName),
      email: validateField('email', requiredData.email),
      password: validateField('password', requiredData.password),
      confirmPassword: validateField('confirmPassword', requiredData.confirmPassword)
    };

    setFieldErrors(newErrors);

    const missingFields = Object.entries(newErrors)
      .filter(([_, error]) => error)
      .map(([field]) => {
        switch(field) {
          case 'userName': return 'Full Name';
          case 'email': return 'Email';
          case 'password': return 'Password';
          case 'confirmPassword': return 'Confirm Password';
          default: return field;
        }
      });

    if (missingFields.length > 0) {
      setError(`Please check the following fields: ${missingFields.join(', ')}`);
      return false;
    }

    return true;
  };

  // Handle required fields changes
  const handleRequiredChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setRequiredData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (touchedFields[name]) {
      const error = validateField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
    
    if (name === 'password') {
      validatePassword(value);
      if (touchedFields.confirmPassword && requiredData.confirmPassword) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: requiredData.confirmPassword !== value ? 'Passwords do not match' : ''
        }));
      }
    }
    
    if (name === 'confirmPassword') {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: value !== requiredData.password ? 'Passwords do not match' : ''
      }));
    }
  };

  // Handle field focus
  const handleFocus = (e) => {
    const { name } = e.target;
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handle optional fields changes
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
    setOptionalData((prev) => ({
      ...prev,
      address, // Populate the input with the selected address
    }));
    setSuggestions([]);
  };

  const handleOptionalChange = (e) => {
    const { name, value, type, files } = e.target;
    if (name === 'address' && value.trim()) {
      fetchAddressSuggestions(value); // Trigger address suggestions
    } else if (name === 'address') {
      setSuggestions([]); // Clear suggestions if input is empty
    }
    setError('');

    if (type === 'file') {
      const file = files[0];
      if (!file) return;

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Company logo must be less than 5MB');
        e.target.value = '';
        return;
      }

      // Validate image type for profile image
      if (!file.type.includes('image/')) {
        setError('Company logo must be an image file');
        e.target.value = '';
        return;
      }

      setOptionalData(prev => ({
        ...prev,
        [name]: file
      }));
    } else {
      setOptionalData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Save registration data and handle profile decision
  const saveRegistration = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requiredData,
          role: 'employer'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (currentStep === 2) {
        // If on complete profile page, save the profile data
        await saveProfileData();
      } else {
        // If on basic registration, show profile completion modal
        setShowProfileModal(true);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission for required fields
  const handleRequiredSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateRequiredFields()) {
      return;
    }

    await saveRegistration();
  };

  // Handle optional fields submission
  const saveProfileData = async () => {
    try {
      const formData = new FormData();
      
      Object.keys(optionalData).forEach(key => {
        if (optionalData[key]) {
          formData.append(key, optionalData[key]);
        }
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/update', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      navigate('/employer/post-internship');
    } catch (err) {
      setError(err.message || 'An error occurred while updating profile');
    }
  };

  // Handle optional submit
  const handleOptionalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateRequiredFields()) {
      return;
    }

    setIsLoading(true);
    await saveRegistration();
  };

  // Handle OAuth signup
  const handleOAuthSignup = (provider) => {
    // OAuth implementation will be added here
    console.log(`${provider} signup clicked`);
  };

  return (
    <div className={styles.container}>
      {showProfileModal && (
        <ProfileCompletionModal 
          onFillNow={() => {
            setShowProfileModal(false);
            setCurrentStep(2);
          }}
          onFillLater={() => {
            setShowProfileModal(false);
            navigate('/employer/post-internship');
          }}
        />
      )}

      <button 
        onClick={() => currentStep === 2 ? setCurrentStep(1) : navigate('/employer/login')}
        className={styles.backButton}
      >
        <FaArrowLeft /> {currentStep === 2 ? 'Back to Sign Up' : 'Back'}
      </button>

      <div className={`${styles.formContainer} ${currentStep === 1 ? styles.formContainerStep1 : styles.formContainerStep2}`}>
        <div className={styles.header}>
          <Link to="/">
            <img
              className={styles.logo}
              src="/images/Logo2.png"
              alt="InternLink Logo"
            />
          </Link>
          <h2 className={styles.title}>
            {currentStep === 1 ? 'Create your account' : 'Complete your profile'}
          </h2>
          <p className={styles.subtitle}>
            {currentStep === 1 
              ? 'Start hiring with InternLink'
              : 'Add company details to attract better candidates'}
          </p>
        </div>

        {currentStep === 1 ? (
          // Step 1: Required Fields
          <form onSubmit={handleRequiredSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="userName" className={styles.label}>
                Full Name
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                required
                value={requiredData.userName}
                onChange={handleRequiredChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={`${styles.input} ${fieldErrors.userName && touchedFields.userName ? styles.inputError : ''}`}
                placeholder="Enter your full name"
              />
              {fieldErrors.userName && touchedFields.userName && (
                <div className={styles.error}>{fieldErrors.userName}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={requiredData.email}
                onChange={handleRequiredChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={`${styles.input} ${fieldErrors.email && touchedFields.email ? styles.inputError : ''}`}
                placeholder="Enter your email"
              />
              {fieldErrors.email && touchedFields.email && (
                <div className={styles.error}>{fieldErrors.email}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={requiredData.password}
                onChange={handleRequiredChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={`${styles.input} ${fieldErrors.password && touchedFields.password ? styles.inputError : ''}`}
                placeholder="Create a password"
              />
              <div className={styles.passwordRequirements}>
                <div className={`${styles.requirement} ${passwordReqs.length ? styles.requirementMet : styles.requirementNotMet}`}>
                  <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>6-50 characters</span>
                </div>
                <div className={`${styles.requirement} ${passwordReqs.uppercase ? styles.requirementMet : styles.requirementNotMet}`}>
                  <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>One uppercase letter</span>
                </div>
                <div className={`${styles.requirement} ${passwordReqs.lowercase ? styles.requirementMet : styles.requirementNotMet}`}>
                  <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>One lowercase letter</span>
                </div>
                <div className={`${styles.requirement} ${passwordReqs.number ? styles.requirementMet : styles.requirementNotMet}`}>
                  <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>One number</span>
                </div>
                <div className={`${styles.requirement} ${passwordReqs.special ? styles.requirementMet : styles.requirementNotMet}`}>
                  <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>One special character (@$!%*?&)</span>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={requiredData.confirmPassword}
                onChange={handleRequiredChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={`${styles.input} ${fieldErrors.confirmPassword && touchedFields.confirmPassword ? styles.inputError : ''}`}
                placeholder="Confirm your password"
              />
              {fieldErrors.confirmPassword && touchedFields.confirmPassword && (
                <div className={styles.error}>{fieldErrors.confirmPassword}</div>
              )}
            </div>

            {error && (
              <div className={styles.error}>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={`${styles.button} ${styles.primaryButton} w-full`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`${styles.button} ${styles.secondaryButton} w-full mt-4`}
            >
              Complete Your Profile
            </button>

            <div className={styles.dividerContainer}>
              <div className={styles.divider}>
                <div className={styles.dividerLine} />
              </div>
              <div className={styles.dividerText}>
                <span className={styles.dividerTextSpan}>Or continue with</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => handleOAuthSignup('google')}
                className={styles.oauthButton}
              >
                <FaGoogle className={styles.googleIcon} />
                <span>Sign up with Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSignup('github')}
                className={styles.oauthButton}
              >
                <FaGithub className={styles.githubIcon} />
                <span>Sign up with GitHub</span>
              </button>
            </div>

            <div className={styles.navigationLinks}>
              Already have an account?{' '}
              <Link to="/employer/login" className={styles.link}>
                Sign in
              </Link>
            </div>
          </form>
        ) : (
          // Step 2: Optional Fields (Company Details)
          <form onSubmit={handleOptionalSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="companyName" className={styles.label}>
                  Company Name <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={optionalData.companyName}
                  onChange={handleOptionalChange}
                  className={styles.input}
                  placeholder="Enter company name"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="profileImage" className={styles.label}>
                  Company Logo <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="profileImage"
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleOptionalChange}
                  className={styles.fileInput}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phoneNumber" className={styles.label}>
                  Company Phone Number <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={optionalData.phoneNumber}
                  onChange={handleOptionalChange}
                  className={styles.input}
                  placeholder="Enter company phone number"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="industry" className={styles.label}>
                  Industry <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="industry"
                  name="industry"
                  type="text"
                  value={optionalData.industry}
                  onChange={handleOptionalChange}
                  className={styles.input}
                  placeholder="Enter company industry"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="companySize" className={styles.label}>
                  Company Size <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="companySize"
                  name="companySize"
                  type="text"
                  value={optionalData.companySize}
                  onChange={handleOptionalChange}
                  className={styles.input}
                  placeholder="e.g. 1-10, 11-50, 51-200"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="companyWebsite" className={styles.label}>
                  Company Website <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="companyWebsite"
                  name="companyWebsite"
                  type="url"
                  value={optionalData.companyWebsite}
                  onChange={handleOptionalChange}
                  className={styles.input}
                  placeholder="Enter company website URL"
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="address" className={styles.label}>
                  Company Address <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={optionalData.address}
                  onChange={handleOptionalChange}
                  className={styles.input}
                  placeholder="Enter company address"
                />
                {isLoading && <div>Loading...</div>}
                {suggestions.length > 1 && (
                <select
                className={internshipStyles.suggestionsDropdown} style={{ width: '100% !important', minWidth: '400px !important', maxWidth: '100% !important' }}
                    onChange={(e) => handleSuggestionSelect(e.target.value)}
                    size={suggestions.length > 5 ? 5 : suggestions.length}
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
                  className={internshipStyles.singleSuggestion}
                    onClick={() => handleSuggestionSelect(suggestions[0].ADDRESS)}
                  >
                    {suggestions[0].ADDRESS}
                  </div>
                )}
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="companyDescription" className={styles.label}>
                  Company Description <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  id="companyDescription"
                  name="companyDescription"
                  value={optionalData.companyDescription}
                  onChange={handleOptionalChange}
                  className={`${styles.input} ${styles.textarea}`}
                  rows={4}
                  placeholder="Describe your company"
                />
              </div>
            </div>

            {error && (
              <div className={styles.error}>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className={`${styles.button} ${styles.primaryButton} flex-1`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account & Save Profile'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EP_EmailSignupPage;
