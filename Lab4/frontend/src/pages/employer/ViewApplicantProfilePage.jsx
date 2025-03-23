import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavigationBar from "../../components/layout/NavigationBar";
import { toast } from "sonner";
import "./ViewApplicantProfilePage.css";

export default function ViewApplicantProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchApplicantProfile = async () => {
      try {
        // Replace with actual API call
        // Mock applicant data
        const mockApplicant = {
          id: id,
          name: "John Doe",
          profileImage: "/default-avatar.png",
          school: "Nanyang Technological University",
          course: "Computer Science",
          yearOfStudy: "Year 3",
          email: "john.doe@example.com",
          contact: "+65 9123 4567",
          personalStatement: "Passionate computer science student with strong problem-solving skills and a keen interest in web development. Looking for opportunities to apply my technical knowledge in a real-world setting and contribute to innovative projects.",
          skills: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"],
          resume: "John_Doe_Resume.pdf" // In a real app, this would be a file URL
        };
        
        setApplicant(mockApplicant);
      } catch (error) {
        console.error("Error fetching applicant profile:", error);
        toast.error("Error loading applicant profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplicantProfile();
  }, [id]);
  
  if (loading) {
    return (
      <>
        <NavigationBar userRole="employer" />
        <div className="loading-container">
          <p>Loading applicant profile...</p>
        </div>
      </>
    );
  }
  
  if (!applicant) {
    return (
      <>
        <NavigationBar userRole="employer" />
        <div className="error-container">
          <p>Applicant not found.</p>
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </>
    );
  }
  
  return (
    <>
      <NavigationBar userRole="employer" />
      <div className="applicant-profile-container">
        <div className="back-section">
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>
        
        <div className="applicant-profile-header">
          <div className="applicant-avatar">
            <img src={applicant.profileImage} alt={applicant.name} />
          </div>
          <div className="applicant-title">
            <h1>{applicant.name}</h1>
            <p className="applicant-education">{applicant.school} • {applicant.course} • {applicant.yearOfStudy}</p>
          </div>
          <div className="applicant-actions">
            <button 
              className="message-btn"
              onClick={() => navigate(`/employer/messages?jobseeker=${applicant.id}`)}
            >
              Message Candidate
            </button>
          </div>
        </div>
        
        <div className="applicant-profile-content">
          <div className="profile-section">
            <h2>Contact Information</h2>
            <div className="contact-info">
              <div className="contact-item">
                <label>Email</label>
                <p>{applicant.email}</p>
              </div>
              <div className="contact-item">
                <label>Phone</label>
                <p>{applicant.contact}</p>
              </div>
            </div>
          </div>
          
          <div className="profile-section">
            <h2>Personal Statement</h2>
            <p className="personal-statement">{applicant.personalStatement}</p>
          </div>
          
          <div className="profile-section">
            <h2>Skills</h2>
            <div className="skills-list">
              {applicant.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
          
          <div className="profile-section">
            <h2>Resume</h2>
            <div className="resume-box">
              <span className="resume-filename">{applicant.resume}</span>
              <button className="download-resume-btn">Download Resume</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}