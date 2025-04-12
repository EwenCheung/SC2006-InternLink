import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JS_ProfilePage.module.css';
import { FaPen, FaPlus, FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaLink, FaTrashAlt, FaDownload, FaUpload, FaFile } from 'react-icons/fa';
import useNotification from '../../hooks/useNotification';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import NotificationStack from '../../components/Common/NotificationStack';
import A11yAnnouncer from '../../components/Common/A11yAnnouncer';
import Dialog from '../../components/Common/Dialog';
import ErrorBoundary from '../../components/Common/ErrorBoundary';
// Import Document from react-pdf for PDF rendering
import { Document, Page, pdfjs } from 'react-pdf';
// Set up the PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Helper function to check resume status
const getResumeStatus = (resumeData) => {
    // If no resume data at all, it's a "no resume" state
    if (!resumeData) {
        return 'empty';
    }
    
    // If there's a pending upload
    if (resumeData.isPending) {
        return 'pending';
    }
    
    // If there's a URL and it's valid
    if (resumeData.url && !resumeData.url.includes('File not found') && 
        !resumeData.url.includes('"success":false') &&
        !resumeData.url.includes('404') &&
        resumeData.url.indexOf('{') !== 0) {
        return 'valid';
    }
    
    // Otherwise, consider it empty/error state
    return 'empty';
};

const ProfileField = ({ label, value, onChange, isEditing, type = 'text', isLoading, hasChanged }) => (
    <div className={styles.fieldRow}>
        <label>{label}</label>
        <div className={`${styles.fieldContent} ${isLoading ? styles.loading : ''} ${hasChanged ? styles.fieldChanged : ''}`}>
            {isEditing ? (
                <>
                    {type === 'select' ? (
                        <select
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className={styles.editInput}
                            disabled={isLoading}
                        >
                            <option value="">Select Year</option>
                            {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    ) : (
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

const ContactDialog = ({ isOpen, onClose, onAdd }) => {
    const [contactType, setContactType] = useState('email');
    const [contactValue, setContactValue] = useState('');
    const [error, setError] = useState('');

    const contactTypes = [
        { id: 'email', label: 'Email', type: 'email', 
          validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          errorMsg: 'Please enter a valid email address' },
        { id: 'phone', label: 'Phone Number', type: 'tel', 
          validate: value => /^\+?[\d\s-]+$/.test(value),
          errorMsg: 'Please enter a valid phone number' },
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
        setError('');
        return true;
    };

    const handleSubmit = () => {
        if (!validateInput()) return;
        onAdd({ type: contactType, value: contactValue });
        setContactValue('');
        setError('');
        onClose();
    };

    const handleTypeChange = (type) => {
        setContactType(type);
        setContactValue('');
        setError('');
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
                            onClick={() => setContactType(type.id)}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
                <div className={styles.inputWrapper}>
                    <input
                        type={contactTypes.find(t => t.id === contactType).type}
                        value={contactValue}
                        onChange={(e) => setContactValue(e.target.value)}
                        placeholder={`Enter your ${contactTypes.find(t => t.id === contactType).label.toLowerCase()}`}
                        className={`${styles.contactInput} ${error ? styles.inputError : ''}`}
                    />
                    {error && <div className={styles.errorMessage}>{error}</div>}
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

const ResumeDisplay = ({ resume, isEditing, onDelete }) => {
    const resumeStatus = getResumeStatus(resume);
    
    // Upload interface component
    const UploadInterface = ({ message = 'Drag or click here to upload your resume' }) => (
        <div 
            className={styles.noResume}
            onClick={() => document.getElementById('resume-upload').click()}
            style={{ cursor: 'pointer' }}
        >
            <div className={styles.noResumeContent}>
                <FaPlus className={styles.uploadIcon} />
                <p>{message}</p>
                <p className={styles.uploadNote}>Accepted format: PDF (Max 10MB)</p>
            </div>
        </div>
    );

    // Handle different resume states
    switch (resumeStatus) {
        case 'empty':
            return <UploadInterface message="Please upload a file" />;

        case 'pending':
            return (
                <div className={styles.pendingResume}>
                    <div className={styles.pendingResumeContent}>
                        <div className={styles.fileNameContainer}>
                            <span className={styles.fileName}>{resume.filename}</span>
                        </div>
                        <p className={styles.uploadNote}>Click "Save Changes" to complete upload</p>
                    </div>
                </div>
            );

        case 'valid':
            // More strict validation to ensure we have a real PDF file
            const hasValidUrl = resume && 
                resume.url && 
                typeof resume.url === 'string' &&
                resume.url.trim() !== '' &&
                !resume.url.includes('File not found') && 
                !resume.url.includes('"success":false') &&
                !resume.url.includes('404') &&
                resume.url.indexOf('{') !== 0;
            
            // Get the file name from the resume object
            const fileName = resume && resume.filename 
                ? resume.filename 
                : "Unknown file";

            return (
                <div className={styles.resumeFileDisplay}>
                    <div className={styles.fileNameContainer}>
                        <span className={styles.fileName}>
                            You have uploaded a file
                        </span>
                    </div>
                    {hasValidUrl && (
                        <div className={isEditing ? styles.resumeActionsEdit : styles.resumeActions}>
                            <a 
                                href={resume.url}
                                className={styles.downloadButton}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={fileName}
                            >
                                <FaDownload /> Download
                            </a>
                            {isEditing && (
                                <button 
                                    className={styles.deleteResumeBtn} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    type="button"
                                >
                                    <FaTrashAlt /> Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            );

        default:
            return <UploadInterface message="Please upload a file" />;
    }
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
    const [tempResume, setTempResume] = useState(null);
    const [resumePreview, setResumePreview] = useState(null);

    const [workExperiences, setWorkExperiences] = useState([]);
    const [academicHistory, setAcademicHistory] = useState([]);
    const [showWorkDialog, setShowWorkDialog] = useState(false);
    const [showAcademicDialog, setShowAcademicDialog] = useState(false);
    const [editingExperience, setEditingExperience] = useState(null);
    const [editingEducation, setEditingEducation] = useState(null);

    const handleDeleteResume = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/files/resume', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete resume');
            }

            // Update local state
            setProfileData(prev => ({
                ...prev,
                resume: null
            }));
            setTempResume(null);
            setResumePreview(null);
            
            // Update original data to prevent "File not found" on cancel
            setOriginalData(prev => ({
                ...prev,
                resume: null
            }));

            showNotification('Resume deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting resume:', error);
            showNotification('Failed to delete resume', 'error');
        }
    };

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

                // Process resume data
                let resumeData = null;
                if (data.resume) {
                    const resumeUrl = data.resume.url;
                    if (resumeUrl && !resumeUrl.includes('File not found') && 
                        !resumeUrl.includes('"success":false') &&
                        !resumeUrl.includes('404')) {
                        resumeData = data.resume;
                    }
                }

                const profileData = {
                    profileImage: data.profileImage?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                    userName: data.userName,
                    school: data.school,
                    course: data.course,
                    yearOfStudy: data.yearOfStudy,
                    contactList: data.contactList || [],
                    skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '',
                    interests: Array.isArray(data.interests) ? data.interests.join(', ') : data.interests || '',
                    personalStatement: data.personalDescription || '',
                    resume: resumeData
                };

                setProfileData(profileData);
                setOriginalData(profileData);

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
            setProfileData(prev => ({
                ...prev,
                [field]: value
            }));
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

    const handleResumeUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            showNotification('File size is too large. Maximum size is 10MB', 'error');
            return;
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            showNotification('Please upload a PDF document', 'error');
            return;
        }

        // Store the file for later upload
        setTempResume(file);
        
        const pendingResume = {
            filename: file.name,
            contentType: file.type,
            size: Math.round(file.size / 1024) + 'KB',
            isPending: true
        };
        
        // Set preview data
        setResumePreview(pendingResume);
        
        // Update profileData
        setProfileData(prev => ({
            ...prev,
            resume: pendingResume
        }));
        
        // Also update originalData to prevent "File not found" on cancel
        setOriginalData(prev => ({
            ...prev,
            resume: prev.resume || null // Keep original resume if it exists, otherwise null
        }));
        
        showNotification('Resume ready to upload. Click "Save Changes" to complete the upload.', 'info');
    };

    const handleSave = async (section) => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem('token');
            const formData = new FormData();
    
            // Append changed fields based on which section we're saving
            Object.entries(profileData).forEach(([key, value]) => {
                // Skip irrelevant fields based on section being saved
                if (section === 'profile') {
                    if (['skills', 'interests', 'personalStatement'].includes(key)) return;
                } else if (section === 'additional') {
                    if (['userName', 'school', 'course', 'yearOfStudy'].includes(key)) return;
                }
                
                // Skip file fields
                if (key === 'resume' || key === 'profileImage') return;
                
                // Only include changed fields
                if (value !== originalData[key]) {
                    formData.append(key, value);
                }
            });
    
            // Add files only if editing profile section
            if (section === 'profile') {
                // Add new profile image
                if (tempFile) {
                    formData.append('profileImage', tempFile);
                }
            }
            
            // Add resume only if editing additional section
            if (section === 'additional') {
                // Explicitly indicate if the resume was deleted
                if (profileData.resume === null) {
                    formData.append('resumeDeleted', 'true');
                } 
                // Otherwise, if we have a new resume, add it
                else if (tempResume) {
                    formData.append('resume', tempResume);
                }
            }
    
            console.log(`Saving ${section} with:`, {
                hasProfileImage: section === 'profile' && tempFile !== null,
                hasResume: section === 'additional' && tempResume !== null,
                resumeDeleted: section === 'additional' && profileData.resume === null,
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

            // Show success notification
            showNotification(`${section === 'profile' ? 'Personal Information' : 'Additional Information'} updated successfully`, 'success');
            
            // Reset appropriate edit mode
            if (section === 'profile') {
                setIsEditingProfile(false);
            } else {
                setIsEditingAdditional(false);
            }
            
            // Refresh the page to show updated profile image and resume
            window.location.reload();
            
        } catch (err) {
            console.error('Error saving profile:', err);
            showNotification(`Error saving ${section === 'profile' ? 'Personal Information' : 'Additional Information'}: ${err.message}`, 'error');
            setIsSaving(false);
        }
    };

    const handleCancel = (section) => {
        if (section === 'profile') {
            setTempFile(null);
            setPreviewUrl(null);
            setIsEditingProfile(false);
            setProfileData(originalData);
        } else {
            setTempResume(null);
            setResumePreview(null);
            setIsEditingAdditional(false);
            
            // Check if resume is in a deleted state (explicitly set to null)
            const isResumeDeleted = profileData.resume === null;
            
            // Update profile data while preserving resume state
            setProfileData(prev => {
                const newData = { ...originalData };
                if (isResumeDeleted) {
                    newData.resume = null;
                }
                return newData;
            });
        }
    };

    const handleAddContact = async (contact) => {
        try {
            // Optimistically update UI
            const newContacts = [...(profileData.contactList || []), contact];
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
                    contactList: prev.contactList.slice(0, -1)
                }));
                throw new Error(await response.text() || 'Failed to add contact');
            }

            const result = await response.json();
            setProfileData(prev => ({
                ...prev,
                contactList: result.data.contactList || []
            }));
            showNotification('Contact added successfully', 'success');
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
                    
                    {/* Top part - Skills/Interests/Statement and Resume */}
                    <div className={styles.additionalTopContent}>
                        {/* Left column - Text fields */}
                        <div className={styles.leftColumn}>
                            <div className={styles.textareaField}>
                                <label>Skills</label>
                                <div className={styles.fieldContent}>
                                    <textarea
                                        value={profileData.skills}
                                        onChange={(e) => handleFieldChange('skills', e.target.value)}
                                        placeholder="List your skills..."
                                        readOnly={!isEditingAdditional}
                                    />
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
                        
                        {/* Right column - Resume */}
                        <div className={styles.rightColumn}>
                            <div className={styles.resumeSection}>
                                <h3>Resume</h3>
                                <input
                                    id="resume-upload"
                                    type="file"
                                    name="resume"
                                    accept=".pdf"
                                    onChange={(e) => {
                                        // Auto-switch to edit mode when a file is selected
                                        if (!isEditingAdditional) {
                                            setIsEditingAdditional(true);
                                        }
                                        handleResumeUpload(e);
                                    }}
                                    className={styles.fileInput}
                                    style={{ display: 'none' }}
                                />
                                <div 
                                    className={styles.resumeContainer}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        
                                        // Auto-switch to edit mode when a file is dropped
                                        if (!isEditingAdditional) {
                                            setIsEditingAdditional(true);
                                        }
                                        
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                            const file = e.dataTransfer.files[0];
                                            // Creating a synthetic event object
                                            handleResumeUpload({
                                                target: { 
                                                    files: [file]
                                                }
                                            });
                                        }
                                    }}
                                >
                                    <ResumeDisplay 
                                        resume={profileData.resume} 
                                        isEditing={isEditingAdditional} 
                                        onDelete={handleDeleteResume} 
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
            </main>
        </ErrorBoundary>
    );
}
