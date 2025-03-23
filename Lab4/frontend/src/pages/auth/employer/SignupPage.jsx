import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../jobseeker/SignupPage.css"; // Reuse styling

export default function EmployerSignupPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    contactNumber: "",
    location: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would handle registration with your backend
    console.log("Signup with:", formData);
    
    // For now, let's just navigate to login
    navigate("/auth/employer/login");
  };

  return (
    <div className="signup-container">
      <div className="back-button">
        <Link to="/auth/employer/login">Back to Login</Link>
      </div>
      
      <div className="signup-content">
        <div className="left-section" style={{ backgroundColor: "#fff0ea" }}>
          <img src="/images/Logo1.png" alt="Employer" className="showcase-image" />
          <h1 className="title-showing" style={{ color: "#ff6b35" }}>Sign up as Employer</h1>
        </div>

        <div className="divider"></div>

        <div className="right-section">
          <h2 className="signup-title">Create Employer Account</h2>
          
          <form className="form-container" onSubmit={handleSubmit}>
            <div className="box">
              <label htmlFor="companyName" className="showcase-words">Company Name:</label>
              <input 
                type="text" 
                id="companyName"
                name="companyName"
                className="input-field" 
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="box">
              <label htmlFor="industry" className="showcase-words">Industry:</label>
              <input 
                type="text" 
                id="industry"
                name="industry"
                className="input-field" 
                placeholder="Enter industry"
                value={formData.industry}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="box">
              <label htmlFor="contactNumber" className="showcase-words">Contact Number:</label>
              <input 
                type="tel" 
                id="contactNumber"
                name="contactNumber"
                className="input-field" 
                placeholder="Enter contact number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="box">
              <label htmlFor="location" className="showcase-words">Location:</label>
              <input 
                type="text" 
                id="location"
                name="location"
                className="input-field" 
                placeholder="Enter company location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="box">
              <label htmlFor="email" className="showcase-words">Email:</label>
              <input 
                type="email" 
                id="email"
                name="email"
                className="input-field" 
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="box">
              <label htmlFor="password" className="showcase-words">Password:</label>
              <input 
                type="password" 
                id="password"
                name="password"
                className="input-field" 
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="box">
              <label htmlFor="confirmPassword" className="showcase-words">Confirm Password:</label>
              <input 
                type="password" 
                id="confirmPassword"
                name="confirmPassword"
                className="input-field" 
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" className="signup-button" style={{ backgroundColor: "#ff6b35" }}>Sign Up</button>
            
            <div className="login-link">
              Already have an account? <Link to="/auth/employer/login" style={{ color: "#ff6b35" }}>Log In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
