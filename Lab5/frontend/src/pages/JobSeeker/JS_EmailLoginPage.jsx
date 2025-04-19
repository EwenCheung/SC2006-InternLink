import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './JS_EmailLoginPage.module.css';
import { FaGoogle, FaGithub, FaExchangeAlt, FaArrowLeft } from 'react-icons/fa';
import AuthFactory from '../../services/AuthFactory';

const JS_EmailLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use the AuthFactory to get a JobSeeker authenticator
      const authenticator = AuthFactory.getAuthenticator('jobseeker');
      const result = await authenticator.login(formData);

      if (!result.success) {
        // Handle different error types from the AuthFactory
        switch (result.errorType) {
          case 'wrong_password':
            setError('Incorrect password. Please try again.');
            break;
          case 'account_not_found':
            setError('No account found with this email. Please sign up first.');
            break;
          case 'wrong_role':
            setError(result.message);
            break;
          case 'connection_error':
            setError('Unable to connect to the server. Please try again later.');
            break;
          default:
            setError(result.message || 'Login failed. Please try again.');
        }
        return;
      }

      // Navigate to find-internship page directly
      navigate('/jobseeker/find-internship', { replace: true });
      
    } catch (err) {
      if (err.name === 'TypeError' || !navigator.onLine) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err.name === 'SyntaxError') {
        setError('Server error. Please try again later.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    // OAuth implementation will be added here
    console.log(`${provider} login clicked`);
  };

  return (
    <div className={styles.container}>
      <button 
        onClick={() => navigate('/')}
        className={styles.backButton}
      >
        <FaArrowLeft /> Back
      </button>

      <button 
        onClick={() => navigate('/employer/login')}
        className={styles.switchRoleButton}
      >
        <FaExchangeAlt /> Switch to Employer
      </button>

      <div className={styles.formContainer}>
        <div className={styles.header}>
          <Link to="/">
            <img
              className={styles.logo}
              src="/images/Logo2.png"
              alt="InternLink Logo"
            />
          </Link>
          <h2 className={styles.title}>Sign in to your Job Seeker account</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className={styles.error}>
              <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingSpan}>
                <svg className={styles.loadingSpinner} viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>

          <div className={styles.dividerContainer}>
            <div className={styles.divider}>
              <div className={styles.dividerLine} />
            </div>
            <div className={styles.dividerText}>
              <span className={styles.dividerTextSpan}>Or continue with</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className={styles.oauthButton}
            >
              <FaGoogle className={styles.googleIcon} /> 
              <span>Sign in with Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className={styles.oauthButton}
            >
              <FaGithub className={styles.githubIcon} /> 
              <span>Sign in with GitHub</span>
            </button>
          </div>
        </form>

        <div className={styles.navigationLinks}>
          New to InternLink?{' '}
          <Link to="/jobseeker/signup" className={styles.link}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JS_EmailLoginPage;
