import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../jobseeker/LoginPage.css"; // Reuse the same styling

export default function EmployerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would handle authentication with your backend
    console.log("Login with:", email, password);
    
    // For now, let's just navigate to the employer dashboard
    navigate("/employer/post-internship");
  };

  return (
    <div className="login-container">
      <div className="back-button">
        <Link to="/auth/choose-role">Back to Choose Role</Link>
      </div>
      
      <div className="login-content">
        <div className="left-section" style={{ backgroundColor: "#fff0ea" }}>
          <img src="/images/Logo1.png" alt="Employer" className="showcase-image" />
          <div className="title-showing" style={{ color: "#ff6b35" }}>Welcome Employer</div>
        </div>

        <div className="divider"></div>

        <div className="right-section">
          <div className="signin-title">Sign in as Employer</div>
          
          <form className="form-container" onSubmit={handleSubmit}>
            <div className="input-box">
              <label className="showcase-words">Email:</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-box">
              <label className="showcase-words">Password:</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button" style={{ backgroundColor: "#ff6b35" }}>Login</button>
            <div className="signup-link">
              Don't have an account? <Link to="/auth/employer/signup" style={{ color: "#ff6b35" }}>Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
