import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './EP_EmailSignupPage.module.css';
import { FaGoogle, FaGithub, FaArrowLeft } from 'react-icons/fa';


const EP_EmailSignupPage = () => {
  const navigate = useNavigate();

  // UI states
  const [currentStep, setCurrentStep] = useState(1);
  const [showProfileChoice, setShowProfileChoice] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null); // Add this line to store image preview

  // Form states
  const [requiredData, setRequiredData] = useState({ // Step 1 - Required fields
    userName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [optionalData, setOptionalData] = useState({ // Step 2 - Optional fields
    profileImage: null, // Company logo
    phoneNumber: '+65',  // Initialize with Singapore country code, just like JS_EmailSignupPage
    industry: '',
    companySize: '',
    companyWebsite: '',
    companyDescription: '',
    address: '',
  });

  // Validation states
  const [touchedFields, setTouchedFields] = useState({}); // Track field interactions
  const [fieldErrors, setFieldErrors] = useState({}); // Track validation errors
  const [passwordReqs, setPasswordReqs] = useState({ // Track password requirements
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });


  // Utility functions and handlers
  const validatePassword = (password) => {
    const reqs = {
      length: password.length >= 8 && password.length <= 12,
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
        return value ? '' : 'Displayed name is required';
      case 'companyName':
        return value ? '' : 'Company name is required';
      case 'email':
        return /\S+@\S+\.\S+/.test(value) ? '' : 'Valid email is required';
      case 'password':
        return validatePassword(value) ? '' : 'Password does not meet requirements';
      case 'confirmPassword':
        return value === requiredData.password ? '' : 'Passwords do not match';
      case 'phoneNumber':
        // Allow any number of digits but validate for 8 digits
        const phoneNum = value.replace(/\D/g, '');
        return phoneNum.length === 8 ? '' : 'You should follow the format, please follow the correct format +65 XXXX-YYYY';
      default:
        return '';
    }
  };

  // Update file input to trigger only on button click
  const handleFileUploadClick = (inputId) => {
    document.getElementById(inputId).click();
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  // Validate required fields
  const validateRequiredFields = () => {
    const fieldsToValidate = [
      { name: 'userName', label: 'Displayed Name' },
      { name: 'companyName', label: 'Company Name' },
      { name: 'email', label: 'Email' },
      { name: 'password', label: 'Password' },
      { name: 'confirmPassword', label: 'Confirm Password' }
    ];

    setTouchedFields(
      fieldsToValidate.reduce((acc, field) => ({ ...acc, [field.name]: true }), {})
    );

    const newErrors = fieldsToValidate.reduce((acc, field) => ({
      ...acc,
      [field.name]: validateField(field.name, requiredData[field.name])
    }), {});

    setFieldErrors(newErrors);

    // Filter out password error from missing fields
    const missingFields = fieldsToValidate
      .filter(field => newErrors[field.name] && field.name !== 'password')
      .map(field => field.label);

    // Handle password error separately
    if (newErrors.password) {
      if (!requiredData.password) {
        missingFields.push('Password');
      } else {
        setError('Password is invalid. Please ensure it meets all requirements.');
        return false;
      }
    }

    if (missingFields.length > 0) {
      setError('Missing required fields:\n' + missingFields.map(field => `• ${field}`).join('\n'));
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
  const handleOptionalChange = (e) => {
    const { name, value, type, files } = e.target;
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

      // Set image preview
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setOptionalData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Check if ALL optional fields are filled
  const hasAllOptionalFields = () => {
    return optionalData.industry && 
           optionalData.companySize && 
           optionalData.phoneNumber && 
           optionalData.companyWebsite && 
           optionalData.companyDescription && 
           optionalData.address && 
           optionalData.profileImage;
  };

  // Handle navigation choice from modal
  const handleProfileChoice = async (completeNow) => {
    setShowProfileChoice(false);
    navigate(completeNow ? '/employer/profile' : '/employer/post-internship');
  };

  // Form submission handlers
  const createAccount = async () => {
    try {
      setIsLoading(true);
      // Prepare registration data
      const registrationData = {
        type: "employer",
        role: "employer",
        email: requiredData.email,
        password: requiredData.password,
        userName: requiredData.userName,
        companyName: requiredData.companyName
      };

      // Add optional fields if they exist
      if (optionalData.phoneNumber) registrationData.phoneNumber = optionalData.phoneNumber;
      if (optionalData.industry) registrationData.industry = optionalData.industry;
      if (optionalData.companySize) registrationData.companySize = optionalData.companySize;
      if (optionalData.companyWebsite) registrationData.website = optionalData.companyWebsite;
      if (optionalData.companyDescription) registrationData.description = optionalData.companyDescription;
      if (optionalData.address) registrationData.location = optionalData.address;

      // Send registration request
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('This email is already registered. Please use a different email address.');
        }
        throw new Error(data.message || 'Registration failed. Please check your information and try again.');
      }

      // Store auth data
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        throw new Error('Invalid response from server. Missing authentication data.');
      }

      // Check navigation path after saving
      if (hasAllOptionalFields()) {
        navigate('/employer/post-internship');
      } else {
        setShowProfileChoice(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission handlers
  const handleRequiredSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateRequiredFields()) {
      return;
    }

    await createAccount();
  };

  const handleOptionalSubmit = async (e) => {
    e.preventDefault();
    if (!validateRequiredFields()) {
      setCurrentStep(1);
      return;
    }
    await createAccount();
  };

  // OAuth handler
  const handleOAuthSignup = (provider) => {
    // OAuth implementation will be added here
    console.log(`${provider} signup clicked`);
  };

  return (
    <div className={styles.container}>
      {showProfileChoice && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Complete Your Profile</h3>
            <p className={styles.modalText}>
              You still have some optional profile fields that could be filled. Would you like to complete them now?
            </p>
            <div className={styles.modalButtons}>
              <button 
                onClick={() => handleProfileChoice(false)}
                className={`${styles.button} ${styles.secondaryButton}`}
              >
                Fill Later
              </button>
              <button 
                onClick={() => handleProfileChoice(true)}
                className={`${styles.button} ${styles.primaryButton}`}
              >
                Complete Now
              </button>
            </div>
          </div>
        </div>
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
            {currentStep === 1 ? 'Create an employer account' : 'Fill in Full Profile'}
          </h2>
          <p className={styles.subtitle}>
            {currentStep === 1 
              ? 'Start hiring with InternLink'
              : 'Add more details to enhance your company profile'}
          </p>
        </div>

        {currentStep === 1 ? (
          // Step 1: Required Fields
          <form onSubmit={handleRequiredSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="userName" className={styles.label}>
                Displayed Name
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
                placeholder="Enter your display name"
              />
              {fieldErrors.userName && touchedFields.userName && (
                <div className={styles.error}>{fieldErrors.userName}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="companyName" className={styles.label}>
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={requiredData.companyName}
                onChange={handleRequiredChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className={`${styles.input} ${fieldErrors.companyName && touchedFields.companyName ? styles.inputError : ''}`}
                placeholder="Enter your company name"
              />
              {fieldErrors.companyName && touchedFields.companyName && (
                <div className={styles.error}>{fieldErrors.companyName}</div>
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
                  <span>8-12 characters</span>
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
              Fill in Full Profile
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
                {profileImagePreview && (
                  <div className={styles.previewContainer}>
                    <img
                      src={profileImagePreview}
                      alt="Company Logo Preview"
                      className={styles.previewImage}
                    />
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phoneNumber" className={styles.label}>
                  Company Phone Number <span className={styles.optional}>(optional)</span>
                </label>
<div className={styles.phoneInputContainer}>
                  <span className={styles.countryCode}>+65</span>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={optionalData.phoneNumber.replace(/^\+65/, '')}
                    onChange={(e) => {
                      // Only allow digits for Singapore phone number (8 digits)
                      let numericValue = e.target.value.replace(/\D/g, '');
                      // Limit to 8 digits
                      numericValue = numericValue.substring(0, 8);
                      
                      // Format as XXXX-YYYY if we have enough digits
                      if (numericValue.length > 4) {
                        numericValue = `${numericValue.substring(0, 4)}-${numericValue.substring(4)}`;
                      }
                      
                      setOptionalData(prev => ({
                        ...prev,
                        phoneNumber: `+65${numericValue}`
                      }));
                    }}
                    onBlur={handleBlur}
                    className={`${styles.phoneInput} ${fieldErrors.phoneNumber && touchedFields.phoneNumber ? styles.inputError : ''}`}
                    placeholder="XXXX-YYYY"
                  />
                </div>
                {fieldErrors.phoneNumber && touchedFields.phoneNumber && (
                  <div className={styles.error}>{fieldErrors.phoneNumber}</div>
                )}
                <div className={styles.phoneHint}>
                  Enter 8 digits in XXXX-YYYY format
                </div>
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

              <div className={styles.inputGroup}>
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
                  'Create Account'
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
