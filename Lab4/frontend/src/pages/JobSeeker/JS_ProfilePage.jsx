import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JS_ProfilePage.module.css';
import { FaPen, FaPlus, FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaLink, FaTrashAlt, FaTimes } from 'react-icons/fa';
import useNotification from '../../hooks/useNotification';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import NotificationStack from '../../components/Common/NotificationStack';
import A11yAnnouncer from '../../components/Common/A11yAnnouncer';
import Dialog from '../../components/Common/Dialog';
import ErrorBoundary from '../../components/Common/ErrorBoundary';
import { fetchUniversities } from '../../../../backend/controllers/universitiesdata.controller.js';
import { fetchSkillsData } from '../../../../backend/controllers/skillsdata.controller.js';

// Course fields and course list - same as in JS_EmailSignupPage
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

const ProfileField = ({ label, value, onChange, isEditing, type = 'text', isLoading, hasChanged }) => {
    const [universities, setUniversities] = useState([]);

    useEffect(() => {
        if (label === "School" && isEditing) {
            const loadUniversities = async () => {
                const data = await fetchUniversities();
                setUniversities(data);
            };
            loadUniversities();
        }
    }, [label, isEditing]);

    // Format phone number with +65 and XXXX-YYYY pattern
    const formatPhoneNumber = (phoneValue) => {
        if (!phoneValue) return '';
        
        // Remove all non-digit characters
        let numericValue = phoneValue.replace(/\D/g, '');
        
        // Remove country code if present
        if (numericValue.startsWith('65')) {
            numericValue = numericValue.substring(2);
        }
        
        // Limit to 8 digits for Singapore phone
        numericValue = numericValue.substring(0, 8);
        
        // Format as XXXX-YYYY if we have enough digits
        if (numericValue.length > 4) {
            numericValue = `${numericValue.substring(0, 4)}-${numericValue.substring(4)}`;
        }
        
        return `+65 ${numericValue}`;
    };
    
    // Handle phone number input specifically
    const handlePhoneChange = (e) => {
        // Only allow digits for Singapore phone number (8 digits)
        let numericValue = e.target.value.replace(/\D/g, '');
        // Remove country code if present
        if (numericValue.startsWith('65')) {
            numericValue = numericValue.substring(2);
        }
        // Limit to 8 digits
        numericValue = numericValue.substring(0, 8);
        
        // Format as XXXX-YYYY if we have enough digits
        if (numericValue.length > 4) {
            numericValue = `${numericValue.substring(0, 4)}-${numericValue.substring(4)}`;
        }
        
        // Always prefix with +65
        onChange(`+65 ${numericValue}`);
    };

    return (
        <div className={styles.fieldRow}>
            <label>{label}</label>
            <div className={`${styles.fieldContent} ${isLoading ? styles.loading : ''} ${hasChanged ? styles.fieldChanged : ''}`}>
                {isEditing ? (
                    <>
                        {/* Year of Study dropdown */}
                        {type === 'select' && (
                            <select
                                value={value || ''}
                                onChange={(e) => onChange(e.target.value)}
                                className={styles.editInput}
                                disabled={isLoading}
                            >
                                <option value="">Select Year</option>
                                {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        )}
                        
                        {/* School dropdown with universities from API */}
                        {label === "School" && (
                            <select
                                value={value || ''}
                                onChange={(e) => onChange(e.target.value)}
                                className={styles.editInput}
                                disabled={isLoading}
                            >
                                <option value="">Select a university</option>
                                {universities.map((university, index) => (
                                    <option key={index} value={university}>
                                        {university}
                                    </option>
                                ))}
                            </select>
                        )}
                        
                        {/* Course dropdown with categories from FIELDS_AND_COURSES */}
                        {label === "Course" && (
                            <select
                                value={value || ''}
                                onChange={(e) => onChange(e.target.value)}
                                className={styles.editInput}
                                disabled={isLoading}
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
                        )}

                        {/* Phone number input with +65 prefix */}
                        {label === "Phone Number" && (
                            <div className={styles.phoneInputContainer}>
                                <span className={styles.countryCode}>+65</span>
                                <input
                                    type="tel"
                                    value={value ? value.replace(/^\+65\s?/, '') : ''}
                                    onChange={handlePhoneChange}
                                    className={styles.phoneInput}
                                    placeholder="XXXX-YYYY"
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                        
                        {/* Default input for other fields */}
                        {type !== 'select' && label !== "School" && label !== "Course" && label !== "Phone Number" && (
                            <input
                                type={type}
                                value={value || ''}
                                onChange={(e) => onChange(e.target.value)}
                                className={styles.editInput}
                                disabled={isLoading}
                            />
                        )}
                        
                        {isLoading && <div className={styles.fieldLoader} />}
                    </>
                ) : (
                    <span>{value || 'Not specified'}</span>
                )}
            </div>
        </div>
    );
};

const ContactDialog = ({ isOpen, onClose, onAdd }) => {
    const [contactType, setContactType] = useState('email');
    const [contactValue, setContactValue] = useState('');
    const [contactTitle, setContactTitle] = useState('');
    const [error, setError] = useState('');

    const contactTypes = [
        { id: 'email', label: 'Email', type: 'email', 
          validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          errorMsg: 'Please enter a valid email address' },
        { id: 'phone', label: 'Phone Number', type: 'tel', 
          validate: value => {
              // For phone numbers with +65 prefix, check for 8 digits
              const phoneNum = value.replace(/\D/g, '');
              return phoneNum.length >= 8; // Needs at least 8 digits (after removing +65)
          },
          errorMsg: 'Please enter a valid Singapore phone number (+65 XXXX-YYYY)' },
        { id: 'linkedin', label: 'LinkedIn', type: 'url', 
          validate: value => value.includes('linkedin.com/'),
          errorMsg: 'Please enter a valid LinkedIn URL' },
        { id: 'github', label: 'GitHub', type: 'url', 
          validate: value => value.includes('github.com/'),
          errorMsg: 'Please enter a valid GitHub URL' },
        { id: 'other', label: 'Other', type: 'text', 
          validate: value => value.length > 0,
          errorMsg: 'Please enter a value' }
    ];

    useEffect(() => {
        // Set default title when contact type changes
        const currentType = contactTypes.find(t => t.id === contactType);
        setContactTitle(currentType.label);
    }, [contactType]);

    const validateInput = () => {
        const currentType = contactTypes.find(t => t.id === contactType);
        if (!contactValue.trim()) {
            setError(`Please enter a ${currentType.label.toLowerCase()}`);
            return false;
        }
        if (!currentType.validate(contactValue)) {
            setError(currentType.errorMsg);
            return false;
        }
        if (!contactTitle.trim()) {
            setError(`Please enter a title for this contact`);
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = () => {
        if (!validateInput()) return;
        onAdd({ 
            type: contactType, 
            value: contactValue,
            title: contactTitle
        });
        setContactValue('');
        setContactTitle('');
        setError('');
        onClose();
    };

    const handleTypeChange = (type) => {
        setContactType(type);
        setContactValue('');
        setError('');
        // Set default title based on the new contact type
        const currentType = contactTypes.find(t => t.id === type);
        setContactTitle(currentType.label);
    };
    
    // Format phone number with Singapore format (+65 XXXX-YYYY)
    const formatPhoneNumber = (input) => {
        // If already has +65, don't add it again
        let value = input;
        if (contactType === 'phone') {
            // Remove all non-digit characters
            let numericValue = value.replace(/\D/g, '');
            
            // Remove country code if present at the beginning
            if (numericValue.startsWith('65')) {
                numericValue = numericValue.substring(2);
            }
            
            // Limit to 8 digits (Singapore phone)
            numericValue = numericValue.substring(0, 8);
            
            // Format as XXXX-YYYY if we have enough digits
            if (numericValue.length > 4) {
                numericValue = `${numericValue.substring(0, 4)}-${numericValue.substring(4)}`;
            }
            
            // Add +65 prefix
            return `+65 ${numericValue}`;
        }
        return value;
    };
    
    const handleInputChange = (e) => {
        if (contactType === 'phone') {
            setContactValue(formatPhoneNumber(e.target.value));
        } else {
            setContactValue(e.target.value);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Add Contact Information"
            primaryAction={{
                label: 'Add',
                onClick: handleSubmit
            }}
            secondaryAction={{
                label: 'Cancel',
                onClick: onClose
            }}
        >
            <div className={styles.contactDialog}>
                <div className={styles.contactTypeSelect}>
                    {contactTypes.map(type => (
                        <button
                            key={type.id}
                            className={`${styles.contactTypeBtn} ${contactType === type.id ? styles.selected : ''}`}
                            onClick={() => handleTypeChange(type.id)}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
                
                <div className={styles.inputWrapper}>
                    <label htmlFor="contactTitle" className={styles.contactLabel}>Title</label>
                    <input
                        id="contactTitle"
                        type="text"
                        value={contactTitle}
                        onChange={(e) => setContactTitle(e.target.value)}
                        placeholder="Enter a title for this contact"
                        className={styles.contactInput}
                    />
                </div>
                
                <div className={styles.inputWrapper}>
                    <label htmlFor="contactValue" className={styles.contactLabel}>
                        {contactTypes.find(t => t.id === contactType).label}
                    </label>
                    
                    {contactType === 'phone' ? (
                        <div className={styles.phoneInputContainer}>
                            <span className={styles.countryCode}>+65</span>
                            <input
                                id="contactValue"
                                type="tel"
                                value={contactValue.replace(/^\+65\s?/, '')}
                                onChange={handleInputChange}
                                placeholder="XXXX-YYYY"
                                className={`${styles.phoneInput} ${error ? styles.inputError : ''}`}
                            />
                        </div>
                    ) : (
                        <input
                            id="contactValue"
                            type={contactTypes.find(t => t.id === contactType).type}
                            value={contactValue}
                            onChange={handleInputChange}
                            placeholder={`Enter your ${contactTypes.find(t => t.id === contactType).label.toLowerCase()}`}
                            className={`${styles.contactInput} ${error ? styles.inputError : ''}`}
                        />
                    )}
                    
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    {contactType === 'phone' && (
                        <div className={styles.phoneHint}>
                            Enter 8 digits in XXXX-YYYY format
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
};

const WorkExperienceDialog = ({ isOpen, onClose, onAdd, experience = null }) => {
    const [title, setTitle] = useState(experience?.title || '');
    const [company, setCompany] = useState(experience?.company || '');
    const [startDate, setStartDate] = useState(experience?.startDate || '');
    const [endDate, setEndDate] = useState(experience?.endDate || '');
    const [description, setDescription] = useState(experience?.description || '');
    const [errors, setErrors] = useState({});
    const isEdit = !!experience;

    const validate = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Job title is required';
        if (!company.trim()) newErrors.company = 'Company name is required';
        if (!startDate) newErrors.startDate = 'Start date is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        
        onAdd({
            id: experience?.id || Date.now().toString(),
            title,
            company,
            startDate,
            endDate,
            description,
        });
        onClose();
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={`${isEdit ? 'Edit' : 'Add'} Work Experience`}
            primaryAction={{
                label: isEdit ? 'Save' : 'Add',
                onClick: handleSubmit
            }}
            secondaryAction={{
                label: 'Cancel',
                onClick: onClose
            }}
        >
            <div className={styles.experienceDialog}>
                <div className={styles.formGroup}>
                    <label htmlFor="job-title">Job Title *</label>
                    <input
                        id="job-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={errors.title ? styles.inputError : ''}
                    />
                    {errors.title && <div className={styles.errorText}>{errors.title}</div>}
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="company-name">Company *</label>
                    <input
                        id="company-name"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className={errors.company ? styles.inputError : ''}
                    />
                    {errors.company && <div className={styles.errorText}>{errors.company}</div>}
                </div>
                
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="start-date">Start Date *</label>
                        <input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={errors.startDate ? styles.inputError : ''}
                        />
                        {errors.startDate && <div className={styles.errorText}>{errors.startDate}</div>}
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="end-date">End Date</label>
                        <input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                        />
                        <small>Leave blank if current position</small>
                    </div>
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="job-description">Description</label>
                    <textarea
                        id="job-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="Describe your responsibilities and achievements..."
                    ></textarea>
                </div>
            </div>
        </Dialog>
    );
};

const AcademicDialog = ({ isOpen, onClose, onAdd, education = null }) => {
    const [degree, setDegree] = useState(education?.degree || '');
    const [institution, setInstitution] = useState(education?.institution || '');
    const [startYear, setStartYear] = useState(education?.startYear || '');
    const [endYear, setEndYear] = useState(education?.endYear || '');
    const [field, setField] = useState(education?.field || '');
    const [errors, setErrors] = useState({});
    const isEdit = !!education;
    
    const validate = () => {
        const newErrors = {};
        if (!degree.trim()) newErrors.degree = 'Degree is required';
        if (!institution.trim()) newErrors.institution = 'Institution name is required';
        if (!startYear) newErrors.startYear = 'Start year is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        
        onAdd({
            id: education?.id || Date.now().toString(),
            degree,
            institution,
            field,
            startYear,
            endYear,
        });
        onClose();
    };

    // Generate year options
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let year = currentYear + 5; year >= currentYear - 30; year--) {
        yearOptions.push(year);
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={`${isEdit ? 'Edit' : 'Add'} Academic Experience`}
            primaryAction={{
                label: isEdit ? 'Save' : 'Add',
                onClick: handleSubmit
            }}
            secondaryAction={{
                label: 'Cancel',
                onClick: onClose
            }}
        >
            <div className={styles.experienceDialog}>
                <div className={styles.formGroup}>
                    <label htmlFor="degree">Degree/Certificate *</label>
                    <input
                        id="degree"
                        type="text"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className={errors.degree ? styles.inputError : ''}
                    />
                    {errors.degree && <div className={styles.errorText}>{errors.degree}</div>}
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="institution">Institution *</label>
                    <input
                        id="institution"
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className={errors.institution ? styles.inputError : ''}
                    />
                    {errors.institution && <div className={styles.errorText}>{errors.institution}</div>}
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="field">Field of Study</label>
                    <input
                        id="field"
                        type="text"
                        value={field}
                        onChange={(e) => setField(e.target.value)}
                    />
                </div>
                
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="start-year">Start Year *</label>
                        <select
                            id="start-year"
                            value={startYear}
                            onChange={(e) => setStartYear(e.target.value)}
                            className={errors.startYear ? styles.inputError : ''}
                        >
                            <option value="">Select Year</option>
                            {yearOptions.map(year => (
                                <option key={`start-${year}`} value={year}>{year}</option>
                            ))}
                        </select>
                        {errors.startYear && <div className={styles.errorText}>{errors.startYear}</div>}
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="end-year">End Year</label>
                        <select
                            id="end-year"
                            value={endYear}
                            onChange={(e) => setEndYear(e.target.value)}
                        >
                            <option value="">Select Year or Expected</option>
                            {yearOptions.map(year => (
                                <option key={`end-${year}`} value={year}>{year}</option>
                            ))}
                        </select>
                        <small>Leave blank if in progress</small>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

const WorkExperienceItem = ({ experience, onEdit, onDelete, isEditing }) => (
    <div className={styles.experienceItem}>
        <div className={styles.experienceHeader}>
            <h4>{experience.title}</h4>
            {isEditing && (
                <div className={styles.experienceActions}>
                    <button onClick={() => onEdit(experience)} className={styles.editBtn}>Edit</button>
                    <button onClick={() => onDelete(experience.id)} className={styles.deleteBtn}>Delete</button>
                </div>
            )}
        </div>
        <div className={styles.experienceCompany}>{experience.company}</div>
        <div className={styles.experiencePeriod}>
            {new Date(experience.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
            {' - '}
            {experience.endDate 
                ? new Date(experience.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                : 'Present'
            }
        </div>
        {experience.description && (
            <div className={styles.experienceDescription}>{experience.description}</div>
        )}
    </div>
);

const AcademicExperienceItem = ({ education, onEdit, onDelete, isEditing }) => (
    <div className={styles.experienceItem}>
        <div className={styles.experienceHeader}>
            <h4>{education.degree}</h4>
            {isEditing && (
                <div className={styles.experienceActions}>
                    <button onClick={() => onEdit(education)} className={styles.editBtn}>Edit</button>
                    <button onClick={() => onDelete(education.id)} className={styles.deleteBtn}>Delete</button>
                </div>
            )}
        </div>
        <div className={styles.experienceCompany}>{education.institution}</div>
        {education.field && (
            <div className={styles.experienceField}>{education.field}</div>
        )}
        <div className={styles.experiencePeriod}>
            {education.startYear}{' - '}{education.endYear || 'Present'}
        </div>
    </div>
);

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={title || "Confirm Deletion"}
            primaryAction={{
                label: 'Delete',
                onClick: onConfirm,
                className: styles.dangerButton
            }}
            secondaryAction={{
                label: 'Cancel',
                onClick: onClose
            }}
        >
            <div className={styles.confirmationDialog}>
                <div className={styles.iconContainer}>
                    <FaTrashAlt className={styles.deleteIcon} />
                </div>
                <p className={styles.confirmationMessage}>
                    {message || "Are you sure you want to delete this item?"}
                </p>
                <p className={styles.confirmationWarning}>
                    This action cannot be undone.
                </p>
            </div>
        </Dialog>
    );
};

// Function to determine field of study based on selected course
const getFieldFromCourse = (selectedCourse) => {
    // Find which field the course belongs to
    for (const [field, courses] of Object.entries(FIELDS_AND_COURSES)) {
        if (courses.includes(selectedCourse)) {
            return field;
        }
    }
    return ''; // Return empty string if no match found
};

export default function JS_ProfilePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { notifications, showNotification, removeNotification } = useNotification();
    const [announcement, setAnnouncement] = useState('');
    const [showContactDialog, setShowContactDialog] = useState(false);
    
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingAdditional, setIsEditingAdditional] = useState(false);
    
    const [profileData, setProfileData] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [applications, setApplications] = useState(null);
    
    const [tempFile, setTempFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [workExperiences, setWorkExperiences] = useState([]);
    const [academicHistory, setAcademicHistory] = useState([]);
    const [showWorkDialog, setShowWorkDialog] = useState(false);
    const [showAcademicDialog, setShowAcademicDialog] = useState(false);
    const [editingExperience, setEditingExperience] = useState(null);
    const [editingEducation, setEditingEducation] = useState(null);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    
    // New state for skills management
    const [availableSkills, setAvailableSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [userSkills, setUserSkills] = useState([]);

    // Fetch skills data when in edit mode
    useEffect(() => {
        if (isEditingAdditional) {
            const loadSkills = async () => {
                try {
                    const skillNames = await fetchSkillsData();
                    setAvailableSkills(skillNames || []);
                } catch (error) {
                    console.error('Error fetching skills:', error);
                    showNotification('Unable to load skills suggestions', 'error');
                }
            };
            loadSkills();
            
            // Initialize userSkills array from profile data
            if (profileData?.skills) {
                const skills = typeof profileData.skills === 'string' 
                    ? profileData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
                    : Array.isArray(profileData.skills) ? profileData.skills : [];
                setUserSkills(skills);
            }
        }
    }, [isEditingAdditional]); // removed profileData?.skills dependency to prevent flashing
    
    // Handle adding a skill
    const handleAddSkill = (e, selectedSkill = null) => {
        if (e) e.preventDefault();
        const skillToAdd = selectedSkill || newSkill.trim();
        
        if (skillToAdd && !userSkills.includes(skillToAdd)) {
            setUserSkills(prev => [...prev, skillToAdd]);
            setNewSkill('');
        }
    };
    
    // Handle removing a skill
    const handleRemoveSkill = (skillToRemove) => {
        setUserSkills(prev => prev.filter(skill => skill !== skillToRemove));
    };
    
    // Update profile data with skills before saving
    useEffect(() => {
        if (isEditingAdditional) {
            // Use a timeout to avoid constant re-renders and flashing
            const timeoutId = setTimeout(() => {
                setProfileData(prev => ({
                    ...prev,
                    skills: userSkills
                }));
            }, 300);
            
            return () => clearTimeout(timeoutId);
        }
    }, [userSkills, isEditingAdditional]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/auth/login');
                    return;
                }

                // Fetch profile data
                const profileResponse = await fetch('/api/auth/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!profileResponse.ok) {
                    throw new Error(await profileResponse.text() || 'Failed to fetch profile');
                }

                const response = await profileResponse.json();
                if (!response.success) {
                    throw new Error(response.message || 'Failed to fetch profile');
                }
                const data = response.data;

                // Process skills data properly - ensure it's always an array
                let skillsArray = [];
                if (data.skills) {
                    if (Array.isArray(data.skills)) {
                        skillsArray = data.skills;
                    } else if (typeof data.skills === 'string') {
                        skillsArray = data.skills.split(',').map(skill => skill.trim()).filter(Boolean);
                    }
                }

                const profileData = {
                    profileImage: data.profileImage?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                    userName: data.userName,
                    school: data.school,
                    course: data.course,
                    yearOfStudy: data.yearOfStudy,
                    contactList: data.contactList || [],
                    skills: skillsArray,
                    interests: Array.isArray(data.interests) ? data.interests.join(', ') : data.interests || '',
                    personalStatement: data.personalDescription || ''
                };

                setProfileData(profileData);
                setOriginalData(profileData);
                
                // Initialize userSkills from profile data
                setUserSkills(skillsArray);

                // Load academicHistory and workExperience from response data
                if (Array.isArray(data.academicHistory)) {
                    setAcademicHistory(data.academicHistory);
                }
                if (Array.isArray(data.workExperience)) {
                    setWorkExperiences(data.workExperience);
                }

                // Fetch applications
                const applicationsResponse = await fetch('/api/applications/application', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (applicationsResponse.ok) {
                    const { data: applicationsData } = await applicationsResponse.json();
                    setApplications(applicationsData || []);
                }

                setIsLoading(false);
            } catch (error) {
                showNotification('Error loading profile: ' + error.message, 'error');
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate, showNotification]);

    const handleFieldChange = (field, value) => {
        if (isEditingProfile || isEditingAdditional) {
            const updatedData = { ...profileData, [field]: value };
            
            // If course is changed, automatically update fieldOfStudy
            if (field === 'course') {
                const fieldOfStudy = getFieldFromCourse(value);
                updatedData.fieldOfStudy = fieldOfStudy;
                console.log(`Course updated: ${value}, Field determined: ${fieldOfStudy}`);
            }
            
            setProfileData(updatedData);
        }
    };

    const handlePhotoUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            showNotification('No file selected', 'error');
            return;
        }

        console.log('Processing file preview:', {
            name: file.name,
            type: file.type,
            size: Math.round(file.size / 1024) + 'KB'
        });

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size is too large. Maximum size is 5MB', 'error');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            showNotification('Please upload a JPG or PNG image', 'error');
            return;
        }

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
            setProfileData(prev => ({
                ...prev,
                profileImage: reader.result
            }));
        };
        reader.readAsDataURL(file);
        setTempFile(file);
    };

    const handleSave = async (section) => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem('token');
            
            // For the additional section, use JSON format to ensure proper array handling
            if (section === 'additional') {
                // Use JSON format for skills to ensure they are sent as a proper array
                const additionalData = {
                    skills: userSkills, // This will be sent as a proper JSON array
                    interests: profileData.interests,
                    personalDescription: profileData.personalStatement
                };
                
                console.log("Sending skills data in JSON format:", additionalData);
                
                const response = await fetch('/api/auth/update', {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(additionalData)
                });
                
                if (!response.ok) {
                    let errorMessage = 'Failed to save profile';
                    try {
                        const errorText = await response.text();
                        if (errorText) {
                            const errorData = JSON.parse(errorText);
                            errorMessage = errorData.message || errorMessage;
                        }
                    } catch (parseError) {
                        console.error('Error parsing response:', parseError);
                        errorMessage = 'Server returned invalid response';
                    }
                    throw new Error(errorMessage);
                }
                
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.message || 'Update failed');
                }
                
                // Update originalData with the new skills to prevent duplication on next save
                setOriginalData(prev => ({
                    ...prev,
                    skills: userSkills,
                    interests: profileData.interests,
                    personalDescription: profileData.personalStatement
                }));
                
                showNotification('Additional Information updated successfully', 'success');
                setIsEditingAdditional(false);
                
                // Add a delay before refreshing to show the notification
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                
            } else {
                // For profile section, continue using FormData
                const formData = new FormData();
                
                // Append changed fields based on the profile section
                Object.entries(profileData).forEach(([key, value]) => {
                    // Skip irrelevant fields for profile section
                    if (['skills', 'interests', 'personalStatement'].includes(key)) return;
                    
                    // Skip file fields
                    if (key === 'profileImage') return;
                    
                    // Only include changed fields
                    if (value !== originalData[key]) {
                        formData.append(key, value);
                    }
                });
                
                // Add files only if editing profile section
                if (tempFile) {
                    formData.append('profileImage', tempFile);
                }
                
                console.log(`Saving ${section} with:`, {
                    hasProfileImage: tempFile !== null,
                    formDataKeys: Array.from(formData.keys())
                });

                const response = await fetch('/api/auth/update', {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                
                if (!response.ok) {
                    let errorMessage = 'Failed to save profile';
                    try {
                        const errorText = await response.text();
                        if (errorText) {
                            const errorData = JSON.parse(errorText);
                            errorMessage = errorData.message || errorMessage;
                        }
                    } catch (parseError) {
                        console.error('Error parsing response:', parseError);
                        errorMessage = 'Server returned invalid response';
                    }
                    throw new Error(errorMessage);
                }
                
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.message || 'Update failed');
                }

                showNotification('Personal Information updated successfully', 'success');
                setIsEditingProfile(false);
                
                // Add a delay before refreshing to show the notification
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
            
        } catch (err) {
            console.error('Error saving profile:', err);
            showNotification(`Error saving ${section === 'profile' ? 'Personal Information' : 'Additional Information'}: ${err.message}`, 'error');
            setIsSaving(false);
        }
    };

    const handleCancel = (section) => {
        if (section === 'profile') {
            // Reset the profile image preview if there was one
            setPreviewUrl(null);
            setTempFile(null);
            
            // Reset the profile data to original
            setProfileData({
                ...originalData
            });
            
            // Exit editing mode
            setIsEditingProfile(false);
            
        } else if (section === 'additional') {
            // Reset skills to original skills
            setUserSkills(
                Array.isArray(originalData.skills) ? [...originalData.skills] : 
                typeof originalData.skills === 'string' ? originalData.skills.split(',').map(skill => skill.trim()).filter(Boolean) : 
                []
            );
            
            // Reset other additional fields
            setProfileData({
                ...profileData,
                skills: originalData.skills,
                interests: originalData.interests,
                personalStatement: originalData.personalStatement
            });
            
            // Exit editing mode
            setIsEditingAdditional(false);
        }
    };

    const handleUpdateContact = async (newContacts) => {
        try {
            // Update UI optimistically
            setProfileData(prev => ({
                ...prev,
                contactList: newContacts
            }));

            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/update-contacts', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contactList: newContacts
                })
            });

            if (!response.ok) {
                // Revert the local change if the server update fails
                setProfileData(prev => ({
                    ...prev,
                    contactList: profileData.contactList  // Restore original contacts
                }));
                throw new Error(await response.text() || 'Failed to update contacts');
            }

            const result = await response.json();
            if (result.success && result.data && result.data.contactList) {
                // Update with the data from server to ensure consistency
                setProfileData(prev => ({
                    ...prev,
                    contactList: result.data.contactList
                }));
                
                // Also update the original data to prevent reversion on cancel
                setOriginalData(prev => ({
                    ...prev,
                    contactList: result.data.contactList
                }));
            }
            showNotification('Contact list updated successfully', 'success');
        } catch (error) {
            showNotification('Error updating contacts: ' + error.message, 'error');
        }
    };

    const handleAddContact = async (contact) => {
        try {
            // Ensure contactList is always an array
            const currentContacts = Array.isArray(profileData.contactList) ? [...profileData.contactList] : [];
            // Create a properly structured contact object to avoid type errors
            const newContact = {
                type: contact.type,
                value: contact.value,
                title: contact.title
            };
            // Create updated contacts list
            const newContacts = [...currentContacts, newContact];
            
            // Use the common update function
            await handleUpdateContact(newContacts);
        } catch (error) {
            showNotification('Error adding contact: ' + error.message, 'error');
        }
    };

    const handleAddWorkExperience = async (experience) => {
        try {
            // First update the local state optimistically
            setWorkExperiences(prev => {
                const updatedExperiences = editingExperience
                    ? prev.map(exp => exp.id === editingExperience.id ? experience : exp)
                    : [...prev, experience];
                return updatedExperiences;
            });
            
            // Then save to backend
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/update-work-experience', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    workExperience: workExperiences.concat(editingExperience 
                        ? [] // If editing, we've already updated the state above
                        : [experience]) // If adding new, include the new experience
                })
            });

            if (!response.ok) {
                throw new Error(await response.text() || 'Failed to save work experience');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Update failed');
            }

            // Show success notification
            showNotification(
                editingExperience 
                    ? 'Work experience updated successfully' 
                    : 'Work experience added successfully', 
                'success'
            );
            
            setEditingExperience(null);
        } catch (error) {
            showNotification('Error saving work experience: ' + error.message, 'error');
            // Revert the optimistic update if there was an error
            if (editingExperience) {
                setWorkExperiences(prev => prev.map(exp => 
                    exp.id === editingExperience.id ? editingExperience : exp
                ));
            } else {
                setWorkExperiences(prev => prev.filter(exp => exp.id !== experience.id));
            }
        }
    };

    const handleAddAcademicExperience = async (education) => {
        try {
            // First update the local state optimistically
            setAcademicHistory(prev => {
                const updatedHistory = editingEducation
                    ? prev.map(edu => edu.id === editingEducation.id ? education : edu)
                    : [...prev, education];
                return updatedHistory;
            });
            
            // Then save to backend
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/update-academic-history', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    academicHistory: academicHistory.concat(editingEducation 
                        ? [] // If editing, we've already updated the state above
                        : [education]) // If adding new, include the new education
                })
            });

            if (!response.ok) {
                throw new Error(await response.text() || 'Failed to save academic history');
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Update failed');
            }

            // Show success notification
            showNotification(
                editingEducation 
                    ? 'Academic history updated successfully' 
                    : 'Academic history added successfully', 
                'success'
            );
            
            setEditingEducation(null);
        } catch (error) {
            showNotification('Error saving academic history: ' + error.message, 'error');
            // Revert the optimistic update if there was an error
            if (editingEducation) {
                setAcademicHistory(prev => prev.map(edu => 
                    edu.id === editingEducation.id ? editingEducation : edu
                ));
            } else {
                setAcademicHistory(prev => prev.filter(edu => edu.id !== education.id));
            }
        }
    };

    const handleDeleteWorkExperience = (id) => {
        setWorkExperiences(prev => prev.filter(exp => exp.id !== id));
    };

    const handleDeleteAcademicExperience = (id) => {
        setAcademicHistory(prev => prev.filter(edu => edu.id !== id));
    };

    const renderContacts = () => {
        return (
            <div className={styles.contacts}>
                <div className={styles.contactsHeader}>
                    <h3>Contact Links</h3>
                    <button 
                        className={styles.addContactBtn}
                        onClick={() => setShowContactDialog(true)}
                    >
                        <FaPlus /> Add Contact
                    </button>
                </div>
                <div className={styles.contactsList}>
                    {profileData.contactList?.map((contact, index) => (
                        <div key={index} className={styles.contactItem}>
                            <div className={styles.contactItemHeader}>
                                <span className={styles.contactTitle}>
                                    {contact.title || (contact.type === 'email' ? 'Email' : 
                                                     contact.type === 'phone' ? 'Phone Number' : 
                                                     contact.type === 'linkedin' ? 'LinkedIn' : 
                                                     contact.type === 'github' ? 'GitHub' : 'Other')}
                                </span>
                                <button 
                                    className={styles.deleteContactBtn} 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setContactToDelete(index);
                                        setShowDeleteDialog(true);
                                    }}
                                    aria-label="Delete contact"
                                >
                                    <FaTrashAlt />
                                </button>
                            </div>
                            
                            {contact.type === 'email' && (
                                <a href={`mailto:${contact.value}`} className={styles.contactLink}>
                                    <FaEnvelope className={styles.contactIcon} />
                                    <span>{contact.value}</span>
                                </a>
                            )}
                            {contact.type === 'phone' && (
                                <a href={`tel:${contact.value}`} className={styles.contactLink}>
                                    <FaPhone className={styles.contactIcon} />
                                    <span>{contact.value}</span>
                                </a>
                            )}
                            {contact.type === 'linkedin' && (
                                <a href={contact.value} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                                    <FaLinkedin className={styles.contactIcon} />
                                    <span>LinkedIn Profile</span>
                                </a>
                            )}
                            {contact.type === 'github' && (
                                <a href={contact.value} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                                    <FaGithub className={styles.contactIcon} />
                                    <span>GitHub Profile</span>
                                </a>
                            )}
                            {contact.type === 'other' && (
                                <div className={styles.contactText}>
                                    <FaLink className={styles.contactIcon} />
                                    <span>{contact.value}</span>
                                </div>
                            )}
                        </div>
                    ))}
                    {(!profileData.contactList || profileData.contactList.length === 0) && (
                        <div className={styles.emptyContacts}>
                            No contacts added yet
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // New function to determine field of study based on selected course
    const getFieldFromCourse = (selectedCourse) => {
        // Find which field the course belongs to
        for (const [field, courses] of Object.entries(FIELDS_AND_COURSES)) {
            if (courses.includes(selectedCourse)) {
                return field;
            }
        }
        return ''; // Return empty string if no match found
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let updatedData = { ...formData, [name]: value };
        
        // If course is changed, automatically update the fieldOfStudy
        if (name === 'course') {
            const fieldOfStudy = getFieldFromCourse(value);
            updatedData.fieldOfStudy = fieldOfStudy;
        }
        
        setFormData(updatedData);
    };

    if (isLoading || !profileData) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <main className={styles.profileContainer}>
                <NotificationStack 
                    notifications={notifications}
                    onRemove={removeNotification}
                />
                {announcement && <A11yAnnouncer message={announcement} />}

                {/* Personal Information Section (formerly Profile) */}
                <section className={styles.profileSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Personal Information</h2>
                        <div className={styles.headerActions}>
                            {isEditingProfile ? (
                                <>
                                    <button 
                                        className={`${styles.headerButton} ${styles.cancelButton}`}
                                        onClick={() => handleCancel('profile')}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className={`${styles.headerButton} ${styles.saveButton}`}
                                        onClick={() => handleSave('profile')}
                                        disabled={isSaving}
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className={styles.editButton}
                                    onClick={() => setIsEditingProfile(true)}
                                >
                                    <FaPen />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.profileContent}>
                        <div className={styles.imageSection}>
                            <div className={styles.profileImage}>
                                <img src={profileData.profileImage} alt="Profile" />
                                {isEditingProfile && (
                                    <form 
                                        className={styles.imageOverlay}
                                        onSubmit={(e) => e.preventDefault()}
                                        encType="multipart/form-data"
                                    >
                                        <input
                                            id="profile-photo-input"
                                            type="file"
                                            name="profileImage"
                                            accept="image/jpeg,image/png"
                                            onChange={handlePhotoUpload}
                                            style={{ display: 'none' }}
                                        />
                                        <label 
                                            htmlFor="profile-photo-input"
                                            className={styles.changePhotoBtn}
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    document.getElementById('profile-photo-input').click();
                                                }
                                            }}
                                        >
                                            Change Photo
                                        </label>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className={styles.basicInfo}>
                            <ProfileField
                                label="Name"
                                value={profileData.userName}
                                onChange={(value) => handleFieldChange('userName', value)}
                                isEditing={isEditingProfile}
                            />
                            <ProfileField
                                label="School"
                                value={profileData.school}
                                onChange={(value) => handleFieldChange('school', value)}
                                isEditing={isEditingProfile}
                            />
                            <ProfileField
                                label="Course"
                                value={profileData.course}
                                onChange={(value) => handleFieldChange('course', value)}
                                isEditing={isEditingProfile}
                            />
                            <ProfileField
                                label="Year of Study"
                                value={profileData.yearOfStudy}
                                onChange={(value) => handleFieldChange('yearOfStudy', value)}
                                isEditing={isEditingProfile}
                                type="select"
                            />
                        </div>
                    </div>

                    {renderContacts()}
                </section>

                {/* Additional Information Section */}
                <section className={styles.additionalSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Additional Information</h2>
                        <div className={styles.headerActions}>
                            {isEditingAdditional ? (
                                <>
                                    <button 
                                        className={`${styles.headerButton} ${styles.cancelButton}`}
                                        onClick={() => handleCancel('additional')}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className={`${styles.headerButton} ${styles.saveButton}`}
                                        onClick={() => handleSave('additional')}
                                        disabled={isSaving}
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className={styles.editButton}
                                    onClick={() => setIsEditingAdditional(true)}
                                >
                                    <FaPen />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Top part - Skills/Interests/Statement */}
                    <div className={styles.additionalTopContent}>
                        {/* Left column - Text fields */}
                        <div className={styles.leftColumn}>
                            <div className={styles.textareaField}>
                                <label>Skills</label>
                                <div className={styles.fieldContent}>
                                    {isEditingAdditional ? (
                                        <div className={styles.skillsEditContainer}>
                                            <div className={styles.skillsContainer}>
                                                {userSkills.map((skill, index) => (
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
                                                {userSkills.length === 0 && (
                                                    <div className={styles.emptySkillsMessage}>
                                                        Type a skill and press Add to start building your skills list
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.skillInputContainer}>
                                                <div className={styles.skillInputWrapper}>
                                                    <input
                                                        type="text"
                                                        value={newSkill}
                                                        onChange={(e) => setNewSkill(e.target.value)}
                                                        className={styles.input}
                                                        placeholder="Add a skill"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                                    />

                                                    {newSkill.trim() !== '' && (
                                                        <ul className={styles.skillSuggestions}>
                                                            {Array.isArray(availableSkills) && availableSkills.length > 0 ? availableSkills
                                                                .filter(
                                                                    (skill) =>
                                                                        skill.toLowerCase().includes(newSkill.toLowerCase()) &&
                                                                        !userSkills.includes(skill)
                                                                )
                                                                .slice(0, 50)
                                                                .map((skill, index) => (
                                                                    <li
                                                                        key={index}
                                                                        className={styles.skillSuggestionItem}
                                                                        onClick={() => handleAddSkill(null, skill)}
                                                                    >
                                                                        {skill}
                                                                    </li>
                                                                )) : <li className={styles.skillSuggestionItem}>Loading skills...</li>}
                                                        </ul>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleAddSkill}
                                                    className={`${styles.button} ${styles.secondaryButton}`}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.skillsViewContainer}>
                                            {userSkills.length > 0 ? (
                                                <ol className={styles.skillsList}>
                                                    {userSkills.map((skill, index) => (
                                                        <li key={index} data-number={index + 1}>
                                                            {skill}
                                                        </li>
                                                    ))}
                                                </ol>
                                            ) : (
                                                <div className={styles.emptyField}>
                                                    <span>No skills added yet</span>
                                                    <p className={styles.emptyFieldHint}>Click the edit button to add your professional skills</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.textareaField}>
                                <label>Interests</label>
                                <div className={styles.fieldContent}>
                                    <textarea
                                        value={profileData.interests}
                                        onChange={(e) => handleFieldChange('interests', e.target.value)}
                                        placeholder="List your interests..."
                                        readOnly={!isEditingAdditional}
                                    />
                                </div>
                            </div>
                            <div className={styles.textareaField}>
                                <label>Personal Statement</label>
                                <div className={styles.fieldContent}>
                                    <textarea
                                        value={profileData.personalStatement}
                                        onChange={(e) => handleFieldChange('personalStatement', e.target.value)}
                                        placeholder="Write your personal statement..."
                                        readOnly={!isEditingAdditional}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom part - spans full width */}
                    <div className={styles.additionalBottomContent}>
                        {/* Academic History Section */}
                        <div className={styles.experienceSectionInner}>
                            <div className={styles.contactsHeader}>
                                <h3>Academic History</h3>
                                <button 
                                    className={styles.addContactBtn}
                                    onClick={() => setShowAcademicDialog(true)}
                                >
                                    <FaPlus /> Add Academic Experience
                                </button>
                            </div>
                            <div className={styles.experienceList}>
                                {academicHistory.map((education) => (
                                    <AcademicExperienceItem
                                        key={education.id}
                                        education={education}
                                        onEdit={(edu) => {
                                            setEditingEducation(edu);
                                            setShowAcademicDialog(true);
                                        }}
                                        onDelete={handleDeleteAcademicExperience}
                                        isEditing={isEditingAdditional}
                                    />
                                ))}
                                {academicHistory.length === 0 && (
                                    <div className={styles.emptyExperience}>
                                        "No academic history added yet. Click 'Add Academic Experience' to add your education history."
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Work Experience Section */}
                        <div className={styles.experienceSectionInner}>
                            <div className={styles.contactsHeader}>
                                <h3>Work Experience</h3>
                                <button 
                                    className={styles.addContactBtn}
                                    onClick={() => setShowWorkDialog(true)}
                                >
                                    <FaPlus /> Add Work Experience
                                </button>
                            </div>
                            <div className={styles.experienceList}>
                                {workExperiences.map((experience) => (
                                    <WorkExperienceItem
                                        key={experience.id}
                                        experience={experience}
                                        onEdit={(exp) => {
                                            setEditingExperience(exp);
                                            setShowWorkDialog(true);
                                        }}
                                        onDelete={handleDeleteWorkExperience}
                                        isEditing={isEditingAdditional}
                                    />
                                ))}
                                {workExperiences.length === 0 && (
                                    <div className={styles.emptyExperience}>
                                        "No work experience added yet. Click 'Add Work Experience' to add your work history."
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Job Applications Section */}
                <section className={styles.applicationsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Job Applications</h2>
                        <button 
                            className={styles.viewApplicationsBtn}
                            onClick={() => navigate('/jobseeker/applications')}
                        >
                            View Applications
                        </button>
                    </div>

                    {applications && applications.length > 0 ? (
                        <div className={styles.applicationGrid}>
                            {applications.map((application, index) => (
                                <div key={index} className={styles.jobBox}>
                                    <h3 className={styles.jobTitle}>{application.jobTitle}</h3>
                                    <p className={styles.jobCompany}>{application.company}</p>
                                    <p className={styles.applicationDate}>
                                        Applied: {new Date(application.appliedDate).toLocaleDateString()}
                                    </p>
                                    <div className={styles.applicationInfo}>
                                        <span className={`${styles.applicationStatus} ${styles[`status${application.status}`]}`}>
                                            {application.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noApplications} onClick={() => navigate('/jobseeker/find-internship')}>
                            <div className={styles.noApplicationsContent}>
                                <FaPlus className={styles.noApplicationsIcon} />
                                <p>Click here to start applying for internships</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Dialog components */}
                <ContactDialog
                    isOpen={showContactDialog}
                    onClose={() => setShowContactDialog(false)}
                    onAdd={handleAddContact}
                />
                <WorkExperienceDialog
                    isOpen={showWorkDialog}
                    onClose={() => {
                        setShowWorkDialog(false);
                        setEditingExperience(null);
                    }}
                    onAdd={handleAddWorkExperience}
                    experience={editingExperience}
                />
                <AcademicDialog
                    isOpen={showAcademicDialog}
                    onClose={() => {
                        setShowAcademicDialog(false);
                        setEditingEducation(null);
                    }}
                    onAdd={handleAddAcademicExperience}
                    education={editingEducation}
                />
                <DeleteConfirmationDialog 
                    isOpen={showDeleteDialog}
                    onClose={() => {
                        setShowDeleteDialog(false);
                        setContactToDelete(null);
                    }}
                    onConfirm={() => {
                        if (contactToDelete !== null) {
                            const newContacts = profileData.contactList.filter((_, i) => i !== contactToDelete);
                            handleUpdateContact(newContacts);
                        }
                        setShowDeleteDialog(false);
                        setContactToDelete(null);
                    }}
                    title="Delete Contact"
                    message="Are you sure you want to delete this contact information?"
                />
            </main>
        </ErrorBoundary>
    );
}
