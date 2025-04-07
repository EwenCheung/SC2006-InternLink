import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JS_ProfilePage.module.css';

const JS_ProfilePage = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        profileImage: '/images/Logo2.png',
        userName: '',
        school: '',
        course: '',
        yearOfStudy: '',
        email: '',
        contact: ''
    });

    const [applications, setApplications] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/jobseeker/login');
            return;
        }

        // Fetch user profile data
        const fetchProfileData = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile data');
                }

                const data = await response.json();
                setProfileData({
                    profileImage: data.profileImage || '/images/Logo2.png',
                    userName: data.userName || '',
                    school: data.school || '',
                    course: data.course || '',
                    yearOfStudy: data.yearOfStudy || '',
                    email: data.email || '',
                    contact: data.contact || ''
                });
            } catch (err) {
                setError('Error fetching profile data');
                console.error(err);
            }
        };

        // Fetch job applications
        const fetchApplications = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/applications/jobseeker', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch applications');
                }

                const data = await response.json();
                setApplications(data.applications);
            } catch (err) {
                setError('Error fetching applications');
                console.error(err);
            }
        };

        fetchProfileData();
        fetchApplications();
    }, [navigate]);

    const handleEditToggle = async () => {
        if (isEditing) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:5001/api/auth/update', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(profileData),
                });

                if (!response.ok) {
                    throw new Error('Failed to update profile');
                }

                setIsEditing(false);
            } catch (err) {
                setError('Failed to save changes');
                console.error(err);
            }
        } else {
            setIsEditing(true);
        }
    };

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePhotoChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('profileImage', file);

            try {
                const response = await fetch('http://localhost:5001/api/auth/upload-photo', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload photo');
                }

                const data = await response.json();
                setProfileData(prev => ({
                    ...prev,
                    profileImage: data.profileImage
                }));
            } catch (err) {
                setError('Failed to upload photo');
                console.error(err);
            }
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending':
                return styles.statusPending;
            case 'accepted':
                return styles.statusAccepted;
            case 'rejected':
                return styles.statusRejected;
            default:
                return styles.statusPending;
        }
    };

    return (
        <div className={styles.profileContainer}>
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.profileHeader}>
                <div className={styles.profileImage}>
                    <div className={styles.imageContainer}>
                        <img src={profileData.profileImage} alt="Profile" />
                        <div className={styles.imageOverlay}>
                            <label className={styles.changePhotoBtn}>
                                Change Photo
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className={styles.personalInfo}>
                    <div className={styles.headerRow}>
                        <h1>{profileData.userName}</h1>
                        <button 
                            className={styles.editProfileBtn}
                            onClick={handleEditToggle}
                        >
                            {isEditing ? 'Save Profile' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <label>School</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className={styles.editInput}
                                    value={profileData.school}
                                    onChange={(e) => handleInputChange('school', e.target.value)}
                                />
                            ) : (
                                <p>{profileData.school}</p>
                            )}
                        </div>

                        <div className={styles.infoItem}>
                            <label>Course</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className={styles.editInput}
                                    value={profileData.course}
                                    onChange={(e) => handleInputChange('course', e.target.value)}
                                />
                            ) : (
                                <p>{profileData.course}</p>
                            )}
                        </div>

                        <div className={styles.infoItem}>
                            <label>Year of Study</label>
                            {isEditing ? (
                                <select
                                    className={styles.editInput}
                                    value={profileData.yearOfStudy}
                                    onChange={(e) => handleInputChange('yearOfStudy', e.target.value)}
                                >
                                    <option value="Year 1">Year 1</option>
                                    <option value="Year 2">Year 2</option>
                                    <option value="Year 3">Year 3</option>
                                    <option value="Year 4">Year 4</option>
                                </select>
                            ) : (
                                <p>{profileData.yearOfStudy}</p>
                            )}
                        </div>

                        <div className={styles.infoItem}>
                            <label>Email</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    className={styles.editInput}
                                    value={profileData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled
                                />
                            ) : (
                                <p>{profileData.email}</p>
                            )}
                        </div>

                        <div className={styles.infoItem}>
                            <label>Contact</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    className={styles.editInput}
                                    value={profileData.contact}
                                    onChange={(e) => handleInputChange('contact', e.target.value)}
                                />
                            ) : (
                                <p>{profileData.contact}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.applications}>
                <h2>Job Applications</h2>
                <div className={styles.jobListings}>
                    {applications.map((application, index) => (
                        <div key={index} className={styles.jobBox}>
                            <h3 className={styles.jobTitle}>{application.job.title}</h3>
                            <p className={styles.jobCompany}>{application.job.company}</p>
                            <p className={styles.jobDescription}>{application.job.description}</p>
                            <div className={styles.applicationInfo}>
                                <span className={getStatusClass(application.status)}>
                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </span>
                                <button 
                                    className={styles.seeDetailsBtn}
                                    onClick={() => navigate(`/jobseeker/applications/${application._id}`)}
                                >
                                    See Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JS_ProfilePage;
