import { Link } from "react-router-dom";
import "./ChooseRolePage.css";

export default function ChooseRolePage() {
  return (
    <div className="choose-role">
      <div className="logo-section">
        <img src="/Images/Logo1.png" alt="InternLink Logo" className="logo" />
        <h1 className="title-showing">Welcome to InternLink</h1>
        <p className="subtitle">Choose your role to continue</p>
      </div>

      <div className="buttons-section">
        <Link to="/auth/jobseeker/login" className="role-button jobseeker-button">
          Job Seeker
        </Link>
        <Link to="/auth/employer/login" className="role-button employer-button">
          Employer
        </Link>
      </div>
    </div>
  );
}
