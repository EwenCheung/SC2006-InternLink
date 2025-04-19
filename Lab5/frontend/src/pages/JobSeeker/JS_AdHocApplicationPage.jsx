import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './ApplicationDetailPage.module.css';
import { FaFilePdf, FaTrash, FaSpinner } from 'react-icons/fa';

const JS_AdHocApplicationPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [details, setDetails] = useState({ name: '', email: '' });
  const [jobseekerID, setJobseekerID] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [error, setError] = useState(null);
  const [resume, setResume] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  // Check if all required fields are filled
  const isFormValid = () => {
    return details.name.trim() !== '' && 
           details.email.trim() !== '' && 
           resume !== null;
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        setDetails({ name: userData.name, email: userData.email });
        setJobseekerID(userData._id);
        console.log('User ID loaded:', userData._id);
      } catch (err) {
        console.error('Error parsing user data:', err);
        navigate('/jobseeker/login');
      }
    } else {
      navigate('/jobseeker/login');
    }
  }, [navigate]);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      return;
    }

    // Create preview URL
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    setResume(file);
    setError(null);
  };

  const clearResume = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setResume(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      
      // Create the application data object
      const postData = {
        jobId: jobId,
        applicantId: jobseekerID,
        jobType: 'adhoc'
      };

      // If a resume is selected, read it as binary and attach it
      if (resume) {
        try {
          // Read the file as binary data
          const fileReader = new FileReader();
          
          // Convert the file reading to a Promise
          const readFileAsArrayBuffer = () => {
            return new Promise((resolve, reject) => {
              fileReader.onload = () => resolve(fileReader.result);
              fileReader.onerror = () => reject(new Error('File reading failed'));
              fileReader.readAsArrayBuffer(resume);
            });
          };
          
          // Wait for the file to be read as array buffer
          const arrayBuffer = await readFileAsArrayBuffer();
          
          // Convert ArrayBuffer to Base64
          const base64String = btoa(
            new Uint8Array(arrayBuffer)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          
          // Add resume data to postData
          postData.resumeData = {
            data: base64String,
            name: resume.name,
            type: resume.type,
            size: resume.size
          };
          
          console.log('Resume encoded successfully, size:', (base64String.length * 0.75) / 1024, 'KB');
        } catch (fileError) {
          console.error('Error reading file:', fileError);
          throw new Error('Failed to process resume file');
        }
      }
      
      // Now create the application with the resume binary data included
      const url = `${API_BASE_URL}/api/jobs/create-application/${jobId}`;
      
      console.log('Sending application request');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = `${errorData.message}`;
          }
        } catch (e) {
          // If we can't parse the error response, use the default message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Application submitted:', data);
      
      // Store application ID for viewing details and show dialog instead of alert
      setApplicationId(data.applicationId || data._id);
      setShowDialog(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle dialog actions
  const handleViewApplication = () => {
    setShowDialog(false);
    navigate(`/jobseeker/applications/${applicationId}`);
  };

  const handleFindMoreJobs = () => {
    setShowDialog(false);
    navigate('/jobseeker/find-adhoc');
  };

  const handleCloseError = () => {
    setError(null);
  };

  // Success Dialog Component
  const SuccessDialog = () => (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <div className={styles.dialogHeader}>
          <h3>Application Submitted!</h3>
        </div>
        <div className={styles.dialogBody}>
          <p>Your application has been submitted successfully.</p>
          <p>What would you like to do next?</p>
        </div>
        <div className={styles.dialogActions}>
          <button 
            onClick={handleViewApplication}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            View Application
          </button>
          <button 
            onClick={handleFindMoreJobs}
            className={styles.button}
          >
            Find More Ad Hoc Jobs
          </button>
        </div>
      </div>
    </div>
  );

  // Error Dialog Component
  const ErrorDialog = () => (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <div className={styles.dialogHeader}>
          <h3>Submission Failed</h3>
        </div>
        <div className={styles.dialogBody}>
          <p>Failed to submit application:</p>
          <p className={styles.errorMessage}>{error}</p>
        </div>
        <div className={styles.dialogActions}>
          <button 
            onClick={handleCloseError}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            Try Again
          </button>
          <button 
            onClick={() => {
              handleCloseError();
              navigate('/jobseeker/find-adhoc');
            }}
            className={styles.button}
          >
            More Ad Hoc Jobs
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <button 
        onClick={() => navigate(`/jobseeker/adhoc/${jobId}`)}
        className={styles.backButton}
      >
        Back
      </button>

      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Verify Your Details</h2>
          <p className={styles.subtitle}>Ensure your information is correct before applying</p>
        </div>

        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
              className={styles.input}
              placeholder="Enter your name"
              required
            />
            {details.name.trim() === '' && (
              <p className={styles.fieldError}>Name is required</p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={details.email}
              onChange={(e) => setDetails({ ...details, email: e.target.value })}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
            {details.email.trim() === '' && (
              <p className={styles.fieldError}>Email is required</p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="resume" className={styles.label}>Resume (PDF only, max 5MB)</label>
            <div className={styles.fileUploadContainer}>
              <input
                type="file"
                id="resume"
                name="resume"
                accept="application/pdf"
                onChange={handleFileChange}
                className={styles.fileInput}
                required
              />
              {!resume && (
                <div className={styles.uploadInstructions} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  justifyContent: "left"
                }}>
                  <FaFilePdf className={styles.pdfIcon} />
                  <span>Click to upload your resume (PDF)</span>
                </div>
              )}
            </div>

            {resume && (
              <div className={styles.previewContainer}>
                <div className={styles.fileInfo} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  justifyContent: "left"
                }}>
                  <FaFilePdf className={styles.pdfIcon} />
                  <span className={styles.fileName}>{resume.name}</span>
                  <span className={styles.fileSize}>({(resume.size / 1024 / 1024).toFixed(2)} MB)</span>
                  <button 
                    type="button" 
                    onClick={clearResume} 
                    className={styles.removeButton}
                    aria-label="Remove resume"
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <iframe 
                  src={previewUrl} 
                  className={styles.pdfPreview} 
                  title="Resume preview"
                ></iframe>
              </div>
            )}

            {!resume && (
              <p className={styles.fieldError}>Resume is required</p>
            )}

            {error && error.includes('File size') && (
              <p className={styles.fileError}>{error}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className={styles.enhancedSubmitButton}
            disabled={jobseekerID === null || isUploading || !isFormValid()}
            style={{ 
              backgroundColor: '#6f42c1', 
              color: 'white',
              background: 'linear-gradient(135deg, #8e44ad, #6f42c1)',
              cursor: (jobseekerID === null || isUploading || !isFormValid()) ? 'not-allowed' : 'pointer',
              opacity: (jobseekerID === null || isUploading || !isFormValid()) ? 0.7 : 1
            }}
          >
            {isUploading ? (
              <>
                <FaSpinner className={styles.loadingIcon} /> Uploading...
              </>
            ) : jobseekerID === null ? (
              'Loading...'
            ) : !isFormValid() ? (
              'Please Complete All Fields'
            ) : (
              'Submit Application'
            )}
          </button>
        </form>
      </div>

      {showDialog && <SuccessDialog />}
      {error && !error.includes('File size') && <ErrorDialog />}
    </div>
  );
};

export default JS_AdHocApplicationPage;
