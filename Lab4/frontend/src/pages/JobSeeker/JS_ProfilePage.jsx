import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JS_ProfilePage.module.css';
import { FaPen, FaPlus } from 'react-icons/fa';
import useNotification from '../../hooks/useNotification';
import useKeyboardFocus from '../../hooks/useKeyboardFocus';
import useFocusTrap from '../../hooks/useFocusTrap';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import NotificationStack from '../../components/Common/NotificationStack';
import A11yAnnouncer from '../../components/Common/A11yAnnouncer';
import Dialog from '../../components/Common/Dialog';
import ErrorBoundary from '../../components/Common/ErrorBoundary';

const ProfileField = ({ label, value, onChange, isEditing, type = 'text' }) => (
    <div className={styles.fieldRow}>
        <label>{label}</label>
        <div className={styles.fieldContent}>
            {isEditing ? (
                type === 'select' ? (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className={styles.editInput}
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
                    />
                )
            ) : (
                <span>{value || 'Not specified'}</span>
            )}
        </div>
    </div>
);

const ContactDialog = ({ isOpen, onClose, onAdd }) => {
    const [contactType, setContactType] = useState('email');
    const [contactValue, setContactValue] = useState('');

    const contactTypes = [
        { id: 'email', label: 'Email', type: 'email' },
        { id: 'phone', label: 'Phone Number', type: 'tel' },
        { id: 'linkedin', label: 'LinkedIn', type: 'url' },
        { id: 'github', label: 'GitHub', type: 'url' },
        { id: 'other', label: 'Other', type: 'text' }
    ];

    const handleSubmit = () => {
        onAdd({ type: contactType, value: contactValue });
        setContactValue('');
        onClose();
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
                <input
                    type={contactTypes.find(t => t.id === contactType).type}
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={`Enter your ${contactTypes.find(t => t.id === contactType).label.toLowerCase()}`}
                    className={styles.contactInput}
                />
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
    const [applications, setApplications] = useState([]);

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

                const data = await profileResponse.json();
                const profileData = {
                    profileImage: data.profileImage || '/images/default-avatar.png',
                    userName: data.userName || 'New User',
                    school: data.school || '',
                    course: data.course || '',
                    yearOfStudy: data.yearOfStudy || '',
                    contacts: data.contacts || [],
                    skills: data.skills || '',
                    interests: data.interests || '',
                    personalStatement: data.personalStatement || '',
                    resume: data.resume || null
                };

                setProfileData(profileData);
                setOriginalData(profileData);

                // Fetch applications
                const applicationsResponse = await fetch('/api/applications/user', {
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
            const response = await fetch('/api/auth/update-profile', {
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
                    contacts: profileData.contacts,
                    skills: profileData.skills,
                    interests: profileData.interests,
                    personalStatement: profileData.personalStatement
                })
            });

            if (!response.ok) {
                throw new Error(await response.text() || 'Failed to update profile');
            }

            const { data: updatedData } = await response.json();
            setProfileData(updatedData);
            setOriginalData(updatedData);
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
        const file = event.target.files[0];
        if (!file) return;

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

            if (!response.ok) {
                throw new Error(await response.text() || 'Failed to upload photo');
            }

            const { data } = await response.json();
            setProfileData(prev => ({
                ...prev,
                profileImage: data.profileImage
            }));
            showNotification('Profile photo updated successfully', 'success');
        } catch (error) {
            showNotification('Error uploading photo: ' + error.message, 'error');
        }
    };

    const handlePhotoChange = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = handlePhotoUpload;
        input.click();
    };

    const handleResumeUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

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

            if (!response.ok) {
                throw new Error(await response.text() || 'Failed to upload resume');
            }

            const { data } = await response.json();
            setProfileData(prev => ({
                ...prev,
                resume: data.resume
            }));
            showNotification('Resume uploaded successfully', 'success');
        } catch (error) {
            showNotification('Error uploading resume: ' + error.message, 'error');
        }
    };

    const handleAddContact = async (contact) => {
        try {
            setProfileData(prev => ({
                ...prev,
                contacts: [...prev.contacts, contact]
            }));
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/update-profile', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contacts: [...profileData.contacts, contact]
                })
            });

            if (!response.ok) {
                // Revert the local change if the server update fails
                setProfileData(prev => ({
                    ...prev,
                    contacts: prev.contacts.slice(0, -1)
                }));
                throw new Error(await response.text() || 'Failed to add contact');
            }

            const { data: updatedProfile } = await response.json();
            setProfileData(updatedProfile);
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
                                    <div className={styles.imageOverlay}>
                                        <button 
                                            className={styles.changePhotoBtn}
                                            onClick={handlePhotoChange}
                                        >
                                            Change Photo
                                        </button>
                                    </div>
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
                            {profileData.contacts.map((contact, index) => (
                                <div key={index} className={styles.contactItem}>
                                    <span>{contact.type}: {contact.value}</span>
                                </div>
                            ))}
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
                                <textarea
                                    value={profileData.skills}
                                    onChange={(e) => handleFieldChange('skills', e.target.value)}
                                    placeholder="List your skills..."
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div className={styles.textareaField}>
                                <label>Interests</label>
                                <textarea
                                    value={profileData.interests}
                                    onChange={(e) => handleFieldChange('interests', e.target.value)}
                                    placeholder="List your interests..."
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div className={styles.textareaField}>
                                <label>Personal Statement</label>
                                <textarea
                                    value={profileData.personalStatement}
                                    onChange={(e) => handleFieldChange('personalStatement', e.target.value)}
                                    placeholder="Write your personal statement..."
                                    readOnly={!isEditing}
                                />
                            </div>
                        </div>
                        <div className={styles.rightColumn}>
                            <div className={styles.resumeSection}>
                                <h3>Resume</h3>
                                {isEditing && (
                                    <div className={styles.resumeUpload}>
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleResumeUpload}
                                            id="resume-upload"
                                            className={styles.fileInput}
                                        />
                                        <label htmlFor="resume-upload">
                                            Upload Resume
                                        </label>
                                    </div>
                                )}
                                {profileData.resume && (
                                    <div className={styles.resumePreview}>
                                        <iframe 
                                            src={profileData.resume}
                                            title="Resume Preview"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Applications Section */}
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

                <ContactDialog
                    isOpen={showContactDialog}
                    onClose={() => setShowContactDialog(false)}
                    onAdd={handleAddContact}
                />
            </main>
        </ErrorBoundary>
    );
}
