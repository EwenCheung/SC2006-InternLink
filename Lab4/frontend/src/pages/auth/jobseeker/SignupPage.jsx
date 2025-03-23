import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignupPage.css";

export default function JobSeekerSignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
    school: "",
    course: "",
    yearOfStudy: "1"
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
    navigate("/auth/jobseeker/login");
  };

  return (
    <div className="signup-container">
      <div className="back-button">
        <Link to="/auth/jobseeker/login">Back to Login</Link>
      </div>
      
      <div className="signup-content">
        <div className="left-section">
          <img src="/images/Logo2.png" alt="Showcase" className="showcase-image" />
          <h1 className="title-showing">Join Us Today!</h1>
        </div>

        <div className="divider"></div>

        <div className="right-section">
          <h2 className="signup-title">Signing Up as Job Seeker</h2>
          
          <form className="form-container" onSubmit={handleSubmit}>
            <div className="box">
              <label htmlFor="email" className="showcase-words">Email</label>
              <input 
                type="email" 
                id="email"
                name="email"
                className="input-field" 
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="box">
              <label htmlFor="password" className="showcase-words">Password</label>
              <input 
                type="password" 
                id="password"
                name="password"
                className="input-field" 
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="box">
              <label htmlFor="confirmPassword" className="showcase-words">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword"
                name="confirmPassword"
                className="input-field" 
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="box">
              <label htmlFor="birthdate" className="showcase-words">Birthdate</label>
              <input 
                type="date" 
                id="birthdate"
                name="birthdate"
                className="input-field"
                value={formData.birthdate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="box">
              <label htmlFor="school" className="showcase-words">School</label>
              <input 
                type="text" 
                id="school"
                name="school"
                className="input-field" 
                placeholder="Enter your school"
                value={formData.school}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="box">
              <label htmlFor="course" className="showcase-words">Course</label>
              <input 
                type="text" 
                id="course"
                name="course"
                className="input-field" 
                placeholder="Enter your course"
                value={formData.course}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="box">
              <label htmlFor="yearOfStudy" className="showcase-words">Year of Study</label>
              <select 
                id="yearOfStudy"
                name="yearOfStudy"
                className="input-field"
                value={formData.yearOfStudy}
                onChange={handleChange}
                required
              >
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            
            <button type="submit" className="signup-button">Sign Up</button>
            
            <div className="login-link">
              Already have an account? <Link to="/auth/jobseeker/login">Log In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
