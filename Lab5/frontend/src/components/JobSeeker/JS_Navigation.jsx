import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './JS_Navigation.module.css';
import AuthFactory from '../../services/AuthFactory';

const JS_Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Check login status on component mount
    const authenticator = AuthFactory.getAuthenticator('jobseeker');
    setIsLoggedIn(authenticator.isLoggedIn());
  }, []);

  const handleLogout = () => {
    // Use the AuthFactory for logout
    const authenticator = AuthFactory.getAuthenticator('jobseeker');
    authenticator.logout();
    
    // Navigate to home after logout
    navigate('/');
  };

  return (
    <nav className={styles.navigation}>
      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        {isLoggedIn && (
          <li>
            <button onClick={handleLogout}>Log out</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default JS_Navigation;