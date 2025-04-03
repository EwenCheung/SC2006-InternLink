import { useState, useEffect } from 'react';
import { fetchUniversities } from '../../../js/fetchUniversities';
import { Link, useNavigate } from 'react-router-dom';
import styles from './JS_EmailSignupPage.module.css';
import { FaGoogle, FaGithub, FaArrowLeft, FaTimes } from 'react-icons/fa';

const ProfileCompletionModal = ({ onFillNow, onFillLater }) => (
  <div className={styles.modal}>
    <div className={styles.modalContent}>
      <h3 className={styles.modalTitle}>Complete Your Profile</h3>
      <p className={styles.modalText}>
        Would you like to complete your profile now? Adding more details helps you get better job recommendations.
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

const JS_EmailSignupPage = () => {
  const [universities, setUniversities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUniversities = async () => {
      const data = await fetchUniversities();
      setUniversities(data);
    };
    loadUniversities();
  }, []);

  // UI states
  const [currentStep, setCurrentStep] = useState(1);
  const [showProfileChoice, setShowProfileChoice] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Form states
  const [requiredData, setRequiredData] = useState({ // Step 1 - Required fields
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [optionalData, setOptionalData] = useState({ // Step 2 - Optional fields
    profileImage: null,
    phoneNumber: '',
    dateOfBirth: '',
    school: '',
    course: '',
    yearOfStudy: '',
    resume: null,
    skills: [],
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
        return value ? '' : 'Full name is required';
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
    const fieldsToValidate = [
      { name: 'userName', label: 'Full Name' },
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

    const missingFields = fieldsToValidate
      .filter(field => newErrors[field.name])
      .map(field => field.label);

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
        setError(`${name === 'resume' ? 'Resume' : 'Profile image'} must be less than 5MB`);
        e.target.value = '';
        return;
      }

      // Validate file type for resume
      if (name === 'resume' && !file.type.includes('pdf')) {
        setError('Resume must be a PDF file');
        e.target.value = '';
        return;
      }

      // Validate image type for profile image
      if (name === 'profileImage' && !file.type.includes('image/')) {
        setError('Profile image must be an image file');
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

  // Handle skills
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !optionalData.skills.includes(newSkill.trim())) {
      setOptionalData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setOptionalData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Form submission handlers
  const createAccount = async (withOptionalData = false) => {
    try {
      setIsLoading(true);
      // Prepare registration data
      const registrationData = {
        type: "jobseeker",
        role: "jobseeker",
        email: requiredData.email,
        password: requiredData.password,
        userName: requiredData.userName
      };

      // Add optional fields if they exist and are requested
      if (withOptionalData) {
        if (optionalData.phoneNumber) registrationData.phoneNumber = optionalData.phoneNumber;
        if (optionalData.dateOfBirth) registrationData.dateOfBirth = optionalData.dateOfBirth;
        if (optionalData.school) registrationData.school = optionalData.school;
        if (optionalData.course) registrationData.course = optionalData.course;
        if (optionalData.yearOfStudy) registrationData.yearOfStudy = optionalData.yearOfStudy;
        if (optionalData.skills.length > 0) registrationData.skills = optionalData.skills;
      }

      // Send registration request
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.message?.includes('duplicate key error')) {
          throw new Error('This email is already registered. Please use a different email address.');
        }
        throw new Error(data.message || 'Registration failed. Please check your information and try again.');
      }

      // Store auth data
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Handle file uploads if they exist
        if (withOptionalData && (optionalData.profileImage || optionalData.resume)) {
          const formData = new FormData();
          if (optionalData.profileImage) formData.append('profileImage', optionalData.profileImage);
          if (optionalData.resume) formData.append('resume', optionalData.resume);

          try {
            const fileResponse = await fetch('/api/user/upload-files', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${data.token}`,
              },
              body: formData,
            });

            if (!fileResponse.ok) {
              console.error('File upload failed');
            }
          } catch (fileError) {
            console.error('File upload error:', fileError);
          }
        }

        navigate('/jobseeker/find-internship');
      } else {
        throw new Error('Invalid response from server. Missing authentication data.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile completion choice
  const handleProfileChoice = async (completeNow) => {
    setShowProfileChoice(false);
    if (completeNow) {
      setCurrentStep(2);
    } else {
      await createAccount(false);
    }
  };

  // Form submission handlers
  const handleRequiredSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateRequiredFields()) {
      return;
    }

    setShowProfileChoice(true);
  };

  const handleOptionalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateRequiredFields()) {
      setCurrentStep(1);
      return;
    }

    await createAccount(true);
  };

  // OAuth handler
  const handleOAuthSignup = (provider) => {
    // OAuth implementation will be added here
    console.log(`${provider} signup clicked`);
  };

  return (
    <div className={styles.container}>
      {showProfileChoice && (
        <ProfileCompletionModal
          onFillNow={() => handleProfileChoice(true)}
          onFillLater={() => handleProfileChoice(false)}
        />
      )}

      <button 
        onClick={() => currentStep === 2 ? setCurrentStep(1) : navigate('/jobseeker/login')}
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
              ? 'Start your journey with InternLink'
              : 'Add more details to get better job recommendations'}
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
              <Link to="/jobseeker/login" className={styles.link}>
                Sign in
              </Link>
            </div>
          </form>
        ) : (
          // Step 2: Optional Fields (Profile Details)
          <form onSubmit={handleOptionalSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="profileImage" className={styles.label}>
                  Profile Image <span className={styles.optional}>(optional)</span>
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
                  Phone Number <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={optionalData.phoneNumber}
                  onChange={handleOptionalChange}
                  className={styles.input}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="dateOfBirth" className={styles.label}>
                  Date of Birth <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={optionalData.dateOfBirth}
                  onChange={handleOptionalChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="school" className={styles.label}>
                  School <span className={styles.optional}>(optional)</span>
                </label>
                <select
                  id="school"
                  name="school"
                  value={optionalData.school}
                  onChange={handleOptionalChange}
                  className={styles.input}
                >
                  <option value="">Select a university</option>
                  {universities.map((university, index) => (
                    <option key={index} value={university}>
                      {university}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="course" className={styles.label}>
                  Course of Study <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="course"
                  name="course"
                  type="text"
                  value={optionalData.course}
                  onChange={handleOptionalChange}
                  className={styles.input}
                  placeholder="Enter your course"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="yearOfStudy" className={styles.label}>
                  Study Year <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="yearOfStudy"
                  name="yearOfStudy"
                  type="text"
                  value={optionalData.yearOfStudy}
                  onChange={handleOptionalChange}
                  className={styles.input}
                  placeholder="Enter your study year"
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="resume" className={styles.label}>
                  Resume <span className={styles.optional}>(optional, PDF only)</span>
                </label>
                <input
                  id="resume"
                  name="resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleOptionalChange}
                  className={styles.fileInput}
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label htmlFor="skills" className={styles.label}>
                  Skills <span className={styles.optional}>(optional)</span>
                </label>
                <div className={styles.skillsContainer}>
                  {optionalData.skills.map((skill, index) => (
                    <div key={index} className={styles.skillTag}>
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className={styles.removeSkill}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className={styles.input}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className={`${styles.button} ${styles.secondaryButton}`}
                  >
                    Add
                  </button>
                </div>
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

export default JS_EmailSignupPage;
