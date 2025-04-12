import { useState, useEffect } from 'react';
import { fetchUniversities } from '../../../../backend/controllers/universitiesdata.controller.js';
import { Link, useNavigate } from 'react-router-dom';
import styles from './JS_EmailSignupPage.module.css';
import { FaGoogle, FaGithub, FaArrowLeft, FaTimes, FaPlus } from 'react-icons/fa';
import {fetchSkillsData} from '../../../../backend/controllers/skillsdata.controller.js';

// Get course fields and course list from VALID_COURSES in job.model.js plus additional options
const FIELDS_AND_COURSES = {
  "Computer Science & IT": [
    "Computer Science",
    "Information Technology",
    "Software Engineering",
    "Information Systems",
    "Cybersecurity",
    "Artificial Intelligence",
    "Data Science",
    "Computer Graphics",
    "Computer Networking",
    "Human-Computer Interaction",
    "Machine Learning",
    "Computer Vision",
    "Natural Language Processing",
    "Robotics",
    "Quantum Computing",
    "Cloud Computing",
    "Internet of Things (IoT)",
    "Blockchain Technology",
    "Augmented Reality",
    "Virtual Reality"
  ],
  "Business & Analytics": [
    "Business Administration",
    "Business Analytics",
    "Marketing Analytics",
    "Financial Analytics",
    "Business Intelligence",
    "Operations Management",
    "Management Information Systems",
    "Supply Chain Analytics",
    "Accounting",
    "Finance",
    "Marketing",
    "Human Resource Management",
    "International Business",
    "Entrepreneurship",
    "Economics",
    "E-commerce",
    "Organizational Behavior",
    "Strategic Management",
    "Project Management"
  ],
  "Engineering": [
    "Computer Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Biomedical Engineering",
    "Environmental Engineering",
    "Aerospace Engineering",
    "Materials Engineering",
    "Industrial Engineering",
    "Nuclear Engineering",
    "Petroleum Engineering",
    "Automotive Engineering",
    "Marine Engineering",
    "Mechatronics Engineering",
    "Structural Engineering",
    "Telecommunications Engineering",
    "Systems Engineering",
    "Geotechnical Engineering"
  ],
  "Natural Sciences": [
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "Statistics",
    "Environmental Science",
    "Biotechnology",
    "Neuroscience",
    "Geology",
    "Astronomy",
    "Oceanography",
    "Meteorology",
    "Ecology",
    "Zoology",
    "Botany",
    "Genetics",
    "Microbiology",
    "Paleontology",
    "Astrophysics"
  ],
  "Social Sciences & Humanities": [
    "Psychology",
    "Economics",
    "Sociology",
    "Political Science",
    "Communication Studies",
    "Linguistics",
    "History",
    "Philosophy",
    "International Relations",
    "Anthropology",
    "Archaeology",
    "Religious Studies",
    "Cultural Studies",
    "Gender Studies",
    "Human Geography",
    "Education",
    "Law",
    "Social Work",
    "Criminology"
  ],
  "Design & Media": [
    "Digital Media",
    "Graphic Design",
    "User Experience Design",
    "Animation",
    "Game Design",
    "Music Technology",
    "Film Studies",
    "Fashion Design",
    "Interior Design",
    "Industrial Design",
    "Photography",
    "Visual Arts",
    "Performing Arts",
    "Theatre Studies",
    "Sound Design",
    "Media Production",
    "Advertising",
    "Public Relations",
    "Journalism"
  ],
  "Health & Medical Sciences": [
    "Medicine",
    "Nursing",
    "Pharmacy",
    "Dentistry",
    "Public Health",
    "Physiotherapy",
    "Occupational Therapy",
    "Nutrition and Dietetics",
    "Biomedical Science",
    "Veterinary Medicine",
    "Radiography",
    "Speech and Language Therapy",
    "Optometry",
    "Midwifery",
    "Medical Laboratory Science",
    "Health Informatics",
    "Clinical Psychology",
    "Epidemiology",
    "Genetic Counseling"
  ],
  "Education": [
    "Early Childhood Education",
    "Primary Education",
    "Secondary Education",
    "Special Education",
    "Educational Leadership",
    "Curriculum and Instruction",
    "Educational Technology",
    "Adult Education",
    "Higher Education",
    "Educational Psychology",
    "Counselor Education",
    "Language Education",
    "Mathematics Education",
    "Science Education",
    "Physical Education",
    "Art Education",
    "Music Education",
    "Vocational Education",
    "Instructional Design"
  ],
  "Agriculture & Environmental Studies": [
    "Agricultural Science",
    "Horticulture",
    "Animal Science",
    "Soil Science",
    "Agribusiness",
    "Forestry",
    "Fisheries Science",
    "Wildlife Management",
    "Environmental Management",
    "Sustainable Agriculture",
    "Food Science and Technology",
    "Plant Pathology",
    "Entomology",
    "Agricultural Engineering",
    "Agroecology",
    "Climate Science",
    "Natural Resource Management",
    "Water Resources Management",
    "Rural Development"
  ],
  "Architecture & Built Environment": [
    "Architecture",
    "Urban Planning",
    "Landscape Architecture",
    "Interior Architecture",
    "Construction Management",
    "Quantity Surveying",
    "Building Services Engineering",
    "Real Estate",
    "Sustainable Design",
    "Historic Preservation",
    "Urban Design",
    "Environmental Design",
    "Structural Engineering",
    "Building Information Modeling (BIM)",
    "Housing Studies",
    "Transportation Planning",
    "Regional Planning",
    "Urban Studies",
    "Facility Management"
  ]
};


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
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const loadSkills = async () => {
      const skillNames = await fetchSkillsData();
      console.log("Fetched skill names:", skillNames);
      setSkills(skillNames);
    };
    loadSkills();
  }, []);


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
    phoneNumber: '+65',  // Initialize with Singapore country code
    dateOfBirth: '',
    school: '',
    course: '',
    yearOfStudy: '',
    resume: null,
    skills: [],
  });
  
  // Image and file preview states
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');

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
        return value ? '' : 'Full name is required';
      case 'email':
        return /\S+@\S+\.\S+/.test(value) ? '' : 'Valid email is required';
      case 'password':
        return validatePassword(value) ? '' : 'Password does not meet requirements';
      case 'confirmPassword':
        return value === requiredData.password ? '' : 'Passwords do not match';
      case 'phoneNumber':
        return /^\+\d{1,3}\d{7,14}$/.test(value) ? '' : 'Valid phone number with country code is required';
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

      // Set preview states
      if (name === 'profileImage') {
        setProfileImagePreview(URL.createObjectURL(file));
      }
      if (name === 'resume') {
        setResumeFileName(file.name);
      }
    } else {
      if (name === 'course' && value) {
        // Auto-assign field of study based on the selected course
        let fieldOfCourse = null;
        
        // Find which field this course belongs to
        for (const [field, courses] of Object.entries(FIELDS_AND_COURSES)) {
          if (courses.includes(value)) {
            fieldOfCourse = field;
            break;
          }
        }
        
        // Update both course and fieldOfStudy
        setOptionalData(prev => ({
          ...prev,
          [name]: value,
          fieldOfStudy: fieldOfCourse
        }));
      } else {
        setOptionalData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  // Handle skills
  const handleAddSkill = (e, selectedSkill = null) => {
    if (e) e.preventDefault();
    const skillToAdd = selectedSkill || newSkill.trim();
    if (
      skillToAdd &&
      !optionalData.skills.includes(skillToAdd)
    ) {
      setOptionalData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillToAdd],
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
        role: "jobseeker",
        email: requiredData.email,
        password: requiredData.password,
        userName: requiredData.userName,
        profileImage: {
          url: 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg',
          uploadedAt: new Date()
        }
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
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      let data;
      try {
        data = await response.json();
      } catch (error) {
        throw new Error('Failed to parse server response. Please try again.');
      }
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
        throw new Error(data.message || 'Registration failed. Please check your information and try again.');
      }

      // Store auth data
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Handle file uploads separately
        if (withOptionalData) {
          if (optionalData.profileImage) {
            try {
              const imageFormData = new FormData();
              imageFormData.append('profileImage', optionalData.profileImage);
              
              await fetch('/api/auth/upload-photo', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${data.token}`
                },
                body: imageFormData
              });
            } catch (error) {
              console.error('Profile image upload failed:', error);
            }
          }

          if (optionalData.resume) {
            try {
              const resumeFormData = new FormData();
              resumeFormData.append('resume', optionalData.resume);

              await fetch('/api/auth/upload-resume', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${data.token}`
                },
                body: resumeFormData
              });
            } catch (error) {
              console.error('Resume upload failed:', error);
            }
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
                autoComplete="name"
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
                autoComplete="email"
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
                autoComplete="new-password"
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
                autoComplete="new-password"
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
                {profileImagePreview && (
                  <div className={styles.previewContainer}>
                    <img
                      src={profileImagePreview}
                      alt="Profile Preview"
                      className={styles.previewImage}
                    />
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phoneNumber" className={styles.label}>
                  Phone Number <span className={styles.optional}>(optional)</span>
                </label>
                <div className={styles.phoneInputContainer}>
                  <span className={styles.countryCode}>+65</span>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={optionalData.phoneNumber.replace(/^\+65/, '')}
                    onChange={(e) => {
                      // Only allow digits
                      const numericValue = e.target.value.replace(/\D/g, '');
                      setOptionalData(prev => ({
                        ...prev,
                        phoneNumber: `+65${numericValue}`
                      }));
                    }}
                    onBlur={handleBlur}
                    className={`${styles.phoneInput} ${fieldErrors.phoneNumber && touchedFields.phoneNumber ? styles.inputError : ''}`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {fieldErrors.phoneNumber && touchedFields.phoneNumber && (
                  <div className={styles.error}>{fieldErrors.phoneNumber}</div>
                )}
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
                <select
                  id="course"
                  name="course"
                  value={optionalData.course}
                  onChange={handleOptionalChange}
                  className={styles.input}
                >
                  <option value="">Select a course</option>
                  {Object.entries(FIELDS_AND_COURSES).map(([field, courses], index) => (
                    <optgroup key={index} label={field}>
                      {courses.map((course, courseIndex) => (
                        <option key={courseIndex} value={course}>
                          {course}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="yearOfStudy" className={styles.label}>
                  Study Year <span className={styles.optional}>(optional)</span>
                </label>
                <select
                  id="yearOfStudy"
                  name="yearOfStudy"
                  value={optionalData.yearOfStudy}
                  onChange={handleOptionalChange}
                  className={styles.input}
                >
                  <option value="">Select year</option>
                  {["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"].map((year, index) => (
                    <option key={index} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
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
                {resumeFileName && (
                  <div className={styles.fileNameDisplay}>
                  </div>
                )}
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

              {/* Input and Add Button Side-by-Side */}
        <div className="flex items-start gap-2 mt-2 relative items-center">
                <div className="w-full relative">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className={styles.input}
                    placeholder="Add a skill"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                  />

                  {newSkill.trim() !== '' && (
                    <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded max-h-40 overflow-auto shadow">
                      {Array.isArray(skills) && skills.length > 0 ? skills
                        .filter(
                          (skill) =>
                            skill.toLowerCase().includes(newSkill.toLowerCase()) &&
                            !optionalData.skills.includes(skill)
                        )
                        .slice(0, 50)
                        .map((skill, index) => (
                          <li
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleAddSkill(null, skill)}
                          >
                            {skill}
                          </li>
                        )) : <li className="px-4 py-2">Loading skills...</li>}
                    </ul>
                  )}
                </div>


                <div className = "gap-2 flex items-center">
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className={`${styles.button} ${styles.secondaryButton} `}
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
            </div>

            <button
              type="submit"
              className={`${styles.button} ${styles.primaryButton} ${styles.formWidthButton}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
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
                  Creating Account & Save Profile
                </span>
              ) : (
                'Create Account & Save Profile'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default JS_EmailSignupPage;
