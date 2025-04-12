import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EP_ProfilePage.module.css';
import { FaPen, FaPlus, FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaLink, FaTrashAlt, FaDownload, FaUpload, FaFile } from 'react-icons/fa';
import useNotification from '../../hooks/useNotification';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import NotificationStack from '../../components/Common/NotificationStack';
import A11yAnnouncer from '../../components/Common/A11yAnnouncer';
import Dialog from '../../components/Common/Dialog';
import ErrorBoundary from '../../components/Common/ErrorBoundary';

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
                            <option value="">Select Company Size</option>
                            {['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '501-1000 employees', '1000+ employees'].map(size => (
                                <option key={size} value={size}>{size}</option>
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
        { id: 'website', label: 'Website', type: 'url', 
          validate: value => value.includes('.'),
          errorMsg: 'Please enter a valid website URL' },
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

export default function EP_ProfilePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { notifications, showNotification, removeNotification } = useNotification();
    const [announcement, setAnnouncement] = useState('');
    const [showContactDialog, setShowContactDialog] = useState(false);
    
    const [isEditingCompany, setIsEditingCompany] = useState(false);
    const [isEditingAdditional, setIsEditingAdditional] = useState(false);
    
    const [profileData, setProfileData] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [internshipJobs, setInternshipJobs] = useState([]);
    const [adHocJobs, setAdHocJobs] = useState([]);
    
    const [tempFile, setTempFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

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

                const profileData = {
                    companyLogo: data.profileImage?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                    companyName: data.companyName || data.userName,
                    industry: data.industry || '',
                    location: data.location || '',
                    companySize: data.companySize || '',
                    contactList: data.contactList || [],
                    missionStatement: data.missionStatement || '',
                    companyDescription: data.companyDescription || '',
                    benefits: data.benefits || ''
                };

                setProfileData(profileData);
                setOriginalData(profileData);

                // Fetch jobs posted by employer - using the correct endpoint like in the Post Internship page
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                
                try {
                    // Fetch internship jobs
                    const internshipResponse = await fetch(`${API_BASE_URL}/api/jobs/internship/my-posts`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (internshipResponse.ok) {
                        const internshipData = await internshipResponse.json();
                        if (internshipData.success) {
                            setInternshipJobs(internshipData.data.jobs || []);
                        }
                    }

                    // Fetch ad-hoc jobs
                    const adhocResponse = await fetch(`${API_BASE_URL}/api/jobs/adhoc/my-posts`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (adhocResponse.ok) {
                        const adhocData = await adhocResponse.json();
                        if (adhocData.success) {
                            setAdHocJobs(adhocData.data.jobs || []);
                        }
                    }
                } catch (jobError) {
                    console.error('Failed to fetch jobs:', jobError);
                    showNotification('Error loading job listings: ' + jobError.message, 'error');
                    setInternshipJobs([]);
                    setAdHocJobs([]);
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
        if (isEditingCompany || isEditingAdditional) {
            setProfileData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleLogoUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            showNotification('No file selected', 'error');
            return;
        }

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
                companyLogo: reader.result
            }));
        };
        reader.readAsDataURL(file);
        setTempFile(file);
    };

    const handleSave = async (section) => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem('token');
            const formData = new FormData();
    
            // Append changed fields based on which section we're saving
            Object.entries(profileData).forEach(([key, value]) => {
                // Skip irrelevant fields based on section being saved
                if (section === 'company') {
                    if (['missionStatement', 'companyDescription', 'benefits'].includes(key)) return;
                } else if (section === 'additional') {
                    if (['companyName', 'industry', 'location', 'companySize'].includes(key)) return;
                }
                
                // Skip file fields
                if (key === 'companyLogo') return;
                
                // Only include changed fields
                if (value !== originalData[key]) {
                    formData.append(key, value);
                }
            });
    
            // Add files only if editing company section
            if (section === 'company') {
                // Add new company logo
                if (tempFile) {
                    formData.append('profileImage', tempFile);
                }
            }
    
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
            showNotification(`${section === 'company' ? 'Company Information' : 'Additional Information'} updated successfully`, 'success');
            
            // Reset appropriate edit mode
            if (section === 'company') {
                setIsEditingCompany(false);
            } else {
                setIsEditingAdditional(false);
            }
            
            // Refresh the page to show updated company logo
            window.location.reload();
            
        } catch (err) {
            console.error('Error saving profile:', err);
            showNotification(`Error saving ${section === 'company' ? 'Company Information' : 'Additional Information'}: ${err.message}`, 'error');
            setIsSaving(false);
        }
    };

    const handleCancel = (section) => {
        if (section === 'company') {
            setTempFile(null);
            setPreviewUrl(null);
            setIsEditingCompany(false);
            setProfileData(originalData);
        } else {
            setIsEditingAdditional(false);
            setProfileData(originalData);
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

                {/* Company Information Section */}
                <section className={styles.profileSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Company Information</h2>
                        <div className={styles.headerActions}>
                            {isEditingCompany ? (
                                <>
                                    <button 
                                        className={`${styles.headerButton} ${styles.cancelButton}`}
                                        onClick={() => handleCancel('company')}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className={`${styles.headerButton} ${styles.saveButton}`}
                                        onClick={() => handleSave('company')}
                                        disabled={isSaving}
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className={styles.editButton}
                                    onClick={() => setIsEditingCompany(true)}
                                >
                                    <FaPen />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.profileContent}>
                        <div className={styles.imageSection}>
                            <div className={styles.profileImage}>
                                <img src={profileData.companyLogo} alt="Company Logo" />
                                {isEditingCompany && (
                                    <form 
                                        className={styles.imageOverlay}
                                        onSubmit={(e) => e.preventDefault()}
                                        encType="multipart/form-data"
                                    >
                                        <input
                                            id="company-logo-input"
                                            type="file"
                                            name="profileImage"
                                            accept="image/jpeg,image/png"
                                            onChange={handleLogoUpload}
                                            style={{ display: 'none' }}
                                        />
                                        <label 
                                            htmlFor="company-logo-input"
                                            className={styles.changePhotoBtn}
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    document.getElementById('company-logo-input').click();
                                                }
                                            }}
                                        >
                                            Change Logo
                                        </label>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className={styles.basicInfo}>
                            <ProfileField
                                label="Company Name"
                                value={profileData.companyName}
                                onChange={(value) => handleFieldChange('companyName', value)}
                                isEditing={isEditingCompany}
                            />
                            <ProfileField
                                label="Industry"
                                value={profileData.industry}
                                onChange={(value) => handleFieldChange('industry', value)}
                                isEditing={isEditingCompany}
                            />
                            <ProfileField
                                label="Location"
                                value={profileData.location}
                                onChange={(value) => handleFieldChange('location', value)}
                                isEditing={isEditingCompany}
                            />
                            <ProfileField
                                label="Company Size"
                                value={profileData.companySize}
                                onChange={(value) => handleFieldChange('companySize', value)}
                                isEditing={isEditingCompany}
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
                                    {contact.type === 'website' && (
                                        <a href={contact.value} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                                            <FaLink className={styles.contactIcon} />
                                            <span>Company Website</span>
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
                    
                    <div className={styles.additionalContent}>
                        <div className={styles.textareaField}>
                            <label>Company Description</label>
                            <div className={styles.fieldContent}>
                                <textarea
                                    value={profileData.companyDescription}
                                    onChange={(e) => handleFieldChange('companyDescription', e.target.value)}
                                    placeholder="Describe your company..."
                                    readOnly={!isEditingAdditional}
                                />
                            </div>
                        </div>
                        <div className={styles.textareaField}>
                            <label>Mission Statement</label>
                            <div className={styles.fieldContent}>
                                <textarea
                                    value={profileData.missionStatement}
                                    onChange={(e) => handleFieldChange('missionStatement', e.target.value)}
                                    placeholder="Enter your company's mission statement..."
                                    readOnly={!isEditingAdditional}
                                />
                            </div>
                        </div>
                        <div className={styles.textareaField}>
                            <label>Employee Benefits</label>
                            <div className={styles.fieldContent}>
                                <textarea
                                    value={profileData.benefits}
                                    onChange={(e) => handleFieldChange('benefits', e.target.value)}
                                    placeholder="List employee benefits offered by your company..."
                                    readOnly={!isEditingAdditional}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Jobs Posted Section */}
                <section className={styles.jobsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Jobs Posted</h2>
                        <div className={styles.headerActions}>
                            <button 
                                className={`${styles.headerButton} ${styles.addButton}`}
                                onClick={() => navigate('/employer/post-internship')}
                            >
                                Post New Internship
                            </button>
                            <button 
                                className={`${styles.headerButton} ${styles.addButton}`}
                                onClick={() => navigate('/employer/post-adhoc')}
                            >
                                Post New Ad-Hoc Job
                            </button>
                        </div>
                    </div>

                    {/* Internship Jobs Section */}
                    <div className={styles.jobSubsection}>
                        <h3>Internship Positions</h3>
                        {internshipJobs && internshipJobs.length > 0 ? (
                            <div className={styles.jobsGrid}>
                                {internshipJobs.map((job, index) => (
                                    <div key={index} className={styles.jobBox} onClick={() => navigate(`/employer/internship/${job._id}`)}>
                                        <div className={job.isDraft ? styles.draftBadge : styles.publishedBadge}>
                                            {job.isDraft ? 'Draft' : 'Published'}
                                        </div>
                                        <div className={styles.jobDetails}>
                                            <h3 className={styles.jobTitle}>{job.title}</h3>
                                            <div className={styles.jobLocation}>
                                                <span>{job.location}</span>
                                            </div>
                                            <div className={styles.jobLocation}>
                                                <span className={styles.stipendInfo}>
                                                    {job.stipend ? `$${job.stipend}/month` : 'Unpaid'}
                                                </span>
                                            </div>
                                            <div className={styles.tagList}>
                                                {job.skills && job.skills.slice(0, 3).map((skill, idx) => (
                                                    <span key={idx} className={styles.tag}>{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={styles.jobStats}>
                                            <span className={styles.applicants}>
                                                {job.applicants?.length || 0} applicant{job.applicants?.length !== 1 ? 's' : ''}
                                            </span>
                                            <span className={styles.postedDate}>
                                                Posted: {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className={styles.deadline}>
                                            Deadline: {new Date(job.deadline).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.noJobs} onClick={() => navigate('/employer/post-internship')}>
                                <div className={styles.noJobsContent}>
                                    <FaPlus className={styles.noJobsIcon} />
                                    <p>Click here to post your first internship position</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ad-Hoc Jobs Section */}
                    <div className={styles.jobSubsection}>
                        <h3>Ad-Hoc Positions</h3>
                        {adHocJobs && adHocJobs.length > 0 ? (
                            <div className={styles.jobsGrid}>
                                {adHocJobs.map((job, index) => (
                                    <div key={index} className={styles.jobBox} onClick={() => navigate(`/employer/adhoc/${job._id}`)}>
                                        <div className={job.isDraft ? styles.draftBadge : styles.publishedBadge}>
                                            {job.isDraft ? 'Draft' : 'Published'}
                                        </div>
                                        <div className={styles.jobDetails}>
                                            <h3 className={styles.jobTitle}>{job.title}</h3>
                                            <div className={styles.jobLocation}>
                                                <span>{job.location}</span>
                                            </div>
                                            <div className={styles.jobLocation}>
                                                <span className={styles.stipendInfo}>
                                                    {job.payment ? `$${job.payment}/job` : 'Payment details unavailable'}
                                                </span>
                                            </div>
                                            <div className={styles.tagList}>
                                                {job.skills && job.skills.slice(0, 3).map((skill, idx) => (
                                                    <span key={idx} className={styles.tag}>{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={styles.jobStats}>
                                            <span className={styles.applicants}>
                                                {job.applicants?.length || 0} applicant{job.applicants?.length !== 1 ? 's' : ''}
                                            </span>
                                            <span className={styles.postedDate}>
                                                Posted: {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className={styles.deadline}>
                                            Deadline: {new Date(job.deadline).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.noJobs} onClick={() => navigate('/employer/post-adhoc')}>
                                <div className={styles.noJobsContent}>
                                    <FaPlus className={styles.noJobsIcon} />
                                    <p>Click here to post your first ad-hoc position</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Dialog components */}
                <ContactDialog
                    isOpen={showContactDialog}
                    onClose={() => setShowContactDialog(false)}
                    onAdd={handleAddContact}
                />
            </main>
        </ErrorBoundary>
    );
}