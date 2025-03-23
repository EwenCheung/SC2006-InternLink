import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavigationBar from "../../components/layout/NavigationBar";
import { toast } from "sonner";
import "./JobDetailsPage.css";

export default function JobSeekerInternshipDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // Replace with actual API call
        const response = await fetch(`/api/jobs/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setJob(data.data);
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
  
  const handleApply = async () => {
    // Implement application submission logic
    toast.success("Application submitted successfully!");
    setShowApplyModal(false);
    // You could navigate to an applications page or stay on this page
  };
  
  const handleShare = () => {
    // Implement share functionality (could copy to clipboard)
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };
  
  if (loading) {
    return (
      <>
        <NavigationBar userRole="jobseeker" />
        <div className="loading-container">
          <p>Loading job details...</p>
        </div>
      </>
    );
  }
  
  if (!job) {
    return (
      <>
        <NavigationBar userRole="jobseeker" />
        <div className="error-container">
          <p>Job not found or no longer available.</p>
          <Link to="/jobseeker/find-internship" className="back-btn">
            Back to Listings
          </Link>
        </div>
      </>
    );
  }
  
  return (
    <>
      <NavigationBar userRole="jobseeker" />
      <div className="job-details-container">
        <div className="back-section">
          <Link to="/jobseeker/find-internship" className="back-btn">
            ← Back to Listings
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
              <h3>Stipend</h3>
              <p>{job.stipend || "Not specified"}</p>
            </div>
            <div className="job-overview-item">
              <h3>Start Date</h3>
              <p>{job.startDate || "Flexible"}</p>
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
          <button 
            className="apply-btn" 
            onClick={() => setShowApplyModal(true)}
          >
            Apply for Position
          </button>
          <button 
            className="message-btn" 
            onClick={() => navigate(`/jobseeker/messages?employer=${job.employerId}`)}
          >
            Message Employer
          </button>
          <button className="share-btn" onClick={handleShare}>
            Share Job
          </button>
        </div>
      </div>
      
      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Apply for {job.title}</h2>
            <p>Are you sure you want to apply for this position at {job.company}?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowApplyModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleApply}>Confirm Application</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}