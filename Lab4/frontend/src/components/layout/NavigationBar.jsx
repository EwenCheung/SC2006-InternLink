import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./NavigationBar.css";

export default function NavigationBar({ userRole }) {
  const [showSettings, setShowSettings] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => {
    return location.pathname.includes(path) ? "active" : "";
  };
  
  const handleLogout = () => {
    // Handle logout logic here
    navigate("/auth/choose-role");
  };
  
  return (
    <div className="navigator-bar">
      <div className="main-nav">
        <h1 className="fl">
          <Link to={userRole === "jobseeker" ? "/jobseeker/find-internship" : "/employer/post-internship"}>
            InternLink
          </Link>
        </h1>
        <nav className="fr">
          <ul>
            {userRole === "jobseeker" ? (
              <>
                <li className="fl">
                  <Link to="/jobseeker/find-internship" className={isActive("find-internship")}>
                    Find Internship
                  </Link>
                </li>
                <li className="fl">
                  <Link to="/jobseeker/find-adhoc" className={isActive("find-adhoc")}>
                    Find Ad Hoc
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="fl">
                  <Link to="/employer/post-internship" className={isActive("post-internship")}>
                    Post Internship
                  </Link>
                </li>
                <li className="fl">
                  <Link to="/employer/post-adhoc" className={isActive("post-adhoc")}>
                    Post Ad Hoc
                  </Link>
                </li>
              </>
            )}
            <li className="fl">
              <Link to={`/${userRole}/messages`} className={isActive("messages")}>
                Messages
              </Link>
            </li>
            <li className="fl">
              <Link to={`/${userRole}/profile`} className={isActive("profile")}>
                Profile
              </Link>
            </li>
            <li className="fl settings">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowSettings(!showSettings);
                }}
              >
                Settings
              </a>
              {showSettings && (
                <div className="settings-box">
                  <div><Link to={`/${userRole}/settings/profile`}>Profile Settings</Link></div>
                  <div><Link to={`/${userRole}/settings/account`}>Account Preferences</Link></div>
                  <div className="logout">
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}>
                      Log Out
                    </a>
                  </div>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
