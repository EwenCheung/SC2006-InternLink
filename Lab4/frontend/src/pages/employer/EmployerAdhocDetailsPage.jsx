import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavigationBar from "../../components/layout/NavigationBar";
import { toast } from "sonner";
import "../jobseeker/JobDetailsPage.css"; // Updated path to reference the CSS file in jobseeker directory

export default function EmployerAdhocDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // Replace with actual API call
        const response = await fetch(`/api/jobs/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setJob(data.data);
          
          // Mock applicants data - replace with actual API call
          setApplicants([
            { id: 'app1', name: 'John Doe', university: 'NTU', status: 'Pending' },
            { id: 'app2', name: 'Jane Smith', university: 'NUS', status: 'Pending' }
          ]);
        } else {
          toast.error("Failed to load job details");
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast.error("Error loading job details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id]);
  
  const handleEditClick = () => {
    navigate(`/employer/edit-adhoc/${id}`);
  };
  
  const handleDeleteClick = async () => {
    try {
      // Replace with actual API call
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success("Job deleted successfully");
        navigate('/employer/post-adhoc');
      } else {
        toast.error("Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Error deleting job");
    }
    setShowDeleteModal(false);
  };
  
  const handleApplicantAction = (applicantId, action) => {
    // Implement applicant management (accept/reject) logic
    toast.success(`Applicant ${action}ed successfully`);
  };
  
  if (loading) {
    return (
      <>
        <NavigationBar userRole="employer" />
        <div className="loading-container">
          <p>Loading job details...</p>
        </div>
      </>
    );
  }
  
  if (!job) {
    return (
      <>
        <NavigationBar userRole="employer" />
        <div className="error-container">
          <p>Ad-hoc job not found or no longer available.</p>
          <Link to="/employer/post-adhoc" className="back-btn">
            Back to Listings
          </Link>
        </div>
      </>
    );
  }
  
  return (
    <>
      <NavigationBar userRole="employer" />
      <div className="job-details-container">
        <div className="back-section">
          <Link to="/employer/post-adhoc" className="back-btn">
            ← Back to My Listings
          </Link>
        </div>
        
        <div className="job-details-header">
          <h1>{job.title}</h1>
          <div className="company-info">
            <h2>{job.company}</h2>
            <p className="location">{job.location}</p>
          </div>
        </div>
        
        <div className="job-details-content">
          <div className="job-overview">
            <div className="job-overview-item">
              <h3>Duration</h3>
              <p>{job.duration || "Not specified"}</p>
            </div>
            <div className="job-overview-item">
              <h3>Compensation</h3>
              <p>{job.compensation || "Not specified"}</p>
            </div>
          </div>
          
          <div className="job-description">
            <h3>Description</h3>
            <p>{job.description}</p>
          </div>
          
          <div className="job-requirements">
            <h3>Requirements</h3>
            <ul>
              {job.requirements && job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          
          <div className="posted-date">
            <p>Posted: {job.postedDate}</p>
          </div>
        </div>
        
        <div className="job-details-actions">
          <button className="edit-btn" onClick={handleEditClick}>
            Edit Post
          </button>
          <button className="delete-btn" onClick={() => setShowDeleteModal(true)}>
            Delete Post
          </button>
        </div>
        
        <div className="applicants-section">
          <h2>Applicants ({applicants.length})</h2>
          {applicants.length === 0 ? (
            <p>No applicants yet.</p>
          ) : (
            <div className="applicants-list">
              {applicants.map(applicant => (
                <div key={applicant.id} className="applicant-card">
                  <div className="applicant-info">
                    <h3>{applicant.name}</h3>
                    <p>{applicant.university}</p>
                    <p className="applicant-status">Status: {applicant.status}</p>
                  </div>
                  <div className="applicant-actions">
                    <button 
                      className="view-profile-btn"
                      onClick={() => navigate(`/employer/view-applicant/${applicant.id}`)}
                    >
                      View Profile
                    </button>
                    <button 
                      className="message-btn"
                      onClick={() => navigate(`/employer/messages?jobseeker=${applicant.id}`)}
                    >
                      Message
                    </button>
                    <div className="decision-buttons">
                      <button 
                        className="accept-btn" 
                        onClick={() => handleApplicantAction(applicant.id, 'accept')}
                      >
                        Accept
                      </button>
                      <button 
                        className="reject-btn" 
                        onClick={() => handleApplicantAction(applicant.id, 'reject')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Delete Ad-hoc Job Post</h2>
            <p>Are you sure you want to delete this ad-hoc job post? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleDeleteClick}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}