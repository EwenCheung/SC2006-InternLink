import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JS_ProfilePage.module.css';
import { FaPen, FaPlus, FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaLink } from 'react-icons/fa';
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

export default function JS_ProfilePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { notifications, showNotification, removeNotification } = useNotification();
    const [announcement, setAnnouncement] = useState('');
    const [showContactDialog, setShowContactDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [applications, setApplications] = useState(null);

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
                profileImage: data.profileImage?.url || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                userName: data.userName,
                school: data.school,
                course: data.course,
                yearOfStudy: data.yearOfStudy,
                contactList: data.contactList || [],
                skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '',
                interests: Array.isArray(data.interests) ? data.interests.join(', ') : data.interests || '',
                personalStatement: data.personalDescription || '',
                resume: data.resume || null
            };

                setProfileData(profileData);
                setOriginalData(profileData);

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
        if (isEditing) {
            setProfileData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/update', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: profileData.userName,
                    school: profileData.school,
                    course: profileData.course,
                    yearOfStudy: profileData.yearOfStudy,
                    contactList: profileData.contactList,
                    skills: profileData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
                    interests: profileData.interests.split(',').map(interest => interest.trim()).filter(Boolean),
                    personalDescription: profileData.personalStatement
                })
            });

            if (!response.ok) {
                throw new Error(await response.text() || 'Failed to update profile');
            }

            const { data: updatedData } = await response.json();
            const newProfileData = {
                ...updatedData,
                profileImage: updatedData.profileImage?.url || profileData.profileImage,
                contactList: updatedData.contactList || [],
                skills: Array.isArray(updatedData.skills) ? updatedData.skills.join(', ') : updatedData.skills || '',
                interests: Array.isArray(updatedData.interests) ? updatedData.interests.join(', ') : updatedData.interests || '',
                personalStatement: updatedData.personalDescription || ''
            };
            setProfileData(newProfileData);
            setOriginalData(newProfileData);
            setIsEditing(false);
            showNotification('Profile updated successfully', 'success');
        } catch (error) {
            showNotification('Error saving profile: ' + error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setProfileData(originalData);
        setIsEditing(false);
    };

    const handlePhotoUpload = async (event) => {
        console.log('Photo upload event:', event);
        console.log('Files:', event.target.files);
        const file = event.target.files?.[0];
        if (!file) {
            console.log('No file selected');
            return;
        }
        console.log('Selected file:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size is too large. Maximum size is 5MB', 'error');
            return;
        }

        // Validate file type
        if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
            showNotification('Please upload a JPG or PNG image', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/upload-photo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to upload photo');
            }

            setProfileData(prev => ({
                ...prev,
                profileImage: data.profileImage
            }));
            showNotification(data.message || 'Profile photo updated successfully', 'success');
        } catch (error) {
            showNotification('Error uploading photo: ' + error.message, 'error');
        }
    };

    const handleResumeUpload = async (event) => {
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

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/upload-resume', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to upload resume');
            }

            setProfileData(prev => ({
                ...prev,
                resume: data.resume
            }));
            showNotification(data.message || 'Resume uploaded successfully', 'success');
        } catch (error) {
            showNotification('Error uploading resume: ' + error.message, 'error');
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

                {/* Profile Section */}
                <section className={styles.profileSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Profile</h2>
                        <div className={styles.headerActions}>
                            {isEditing ? (
                                <>
                                    <button 
                                        className={`${styles.headerButton} ${styles.cancelButton}`}
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className={`${styles.headerButton} ${styles.saveButton}`}
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className={styles.editButton}
                                    onClick={() => setIsEditing(true)}
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
                                {isEditing && (
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
                                isEditing={isEditing}
                            />
                            <ProfileField
                                label="School"
                                value={profileData.school}
                                onChange={(value) => handleFieldChange('school', value)}
                                isEditing={isEditing}
                            />
                            <ProfileField
                                label="Course"
                                value={profileData.course}
                                onChange={(value) => handleFieldChange('course', value)}
                                isEditing={isEditing}
                            />
                            <ProfileField
                                label="Year of Study"
                                value={profileData.yearOfStudy}
                                onChange={(value) => handleFieldChange('yearOfStudy', value)}
                                isEditing={isEditing}
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
                    <h2>Additional Information</h2>
                    <div className={styles.additionalContent}>
                        <div className={styles.leftColumn}>
                            <div className={styles.textareaField}>
                                <label>Skills</label>
                                <div className={styles.fieldContent}>
                                    <textarea
                                        value={profileData.skills}
                                        onChange={(e) => handleFieldChange('skills', e.target.value)}
                                        placeholder="List your skills..."
                                        readOnly={!isEditing}
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
                                        readOnly={!isEditing}
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
                                        readOnly={!isEditing}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.rightColumn}>
                            <div className={styles.resumeSection}>
                                <h3>Resume</h3>
                                {isEditing && (
                                    <form 
                                        className={styles.resumeUpload}
                                        onSubmit={(e) => e.preventDefault()}
                                        encType="multipart/form-data"
                                    >
                                        <input
                                            id="resume-upload"
                                            type="file"
                                            name="resume"
                                            accept=".pdf"
                                            onChange={handleResumeUpload}
                                            className={styles.fileInput}
                                            style={{ display: 'none' }}
                                        />
                                        <label 
                                            htmlFor="resume-upload"
                                            className={styles.uploadButton}
                                        >
                                            Upload Resume
                                        </label>
                                    </form>
                                )}
                                {profileData.resume?.url && (
                                    <div className={styles.resumePreview}>
                                        {profileData.resume.contentType === 'application/pdf' ? (
                                            <embed
                                                src={profileData.resume.url}
                                                type={profileData.resume.contentType}
                                                width="100%"
                                                height="500px"
                                            />
                                        ) : (
                                            <div className={styles.resumeDownload}>
                                                <p>Resume ({profileData.resume.filename}) uploaded successfully</p>
                                                <a 
                                                    href={profileData.resume.url} 
                                                    download={profileData.resume.filename}
                                                    className={styles.downloadButton}
                                                >
                                                    Download Resume ({profileData.resume.filename})
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Applications Section */}
                {applications !== null && applications.length > 0 && (
                    <section className={styles.applicationsSection}>
                        <h2>Job Applications</h2>
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
                                    <button className={styles.seeDetailsBtn}>See Details</button>
                                </div>
                            </div>
                        ))}
                        </div>
                    </section>
                )}

                <ContactDialog
                    isOpen={showContactDialog}
                    onClose={() => setShowContactDialog(false)}
                    onAdd={handleAddContact}
                />
            </main>
        </ErrorBoundary>
    );
}
