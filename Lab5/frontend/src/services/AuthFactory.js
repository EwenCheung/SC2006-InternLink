/**
 * AuthFactory.js
 * Implements the Factory design pattern for authentication operations
 */

import config from '../config.js';

const API_BASE_URL = config.apiBaseUrl;

// Abstract base authenticator (for the Strategy pattern)
class BaseAuthenticator {
  constructor() {
    if (this.constructor === BaseAuthenticator) {
      throw new Error("Abstract class 'BaseAuthenticator' cannot be instantiated.");
    }
  }
  
  async login() {
    throw new Error("Method 'login' must be implemented.");
  }
  
  async logout() {
    throw new Error("Method 'logout' must be implemented.");
  }

  // Helper method to analyze authentication errors
  analyzeAuthError(email, status, serverMessage) {
    // Check for specific server messages first
    if (serverMessage) {
      if (serverMessage.toLowerCase().includes('password') && serverMessage.toLowerCase().includes('incorrect')) {
        return {
          success: false,
          status: status,
          message: 'Incorrect password. Please try again.',
          errorType: 'wrong_password'
        };
      }
      
      if (serverMessage.toLowerCase().includes('user not found') || 
          serverMessage.toLowerCase().includes('no account') ||
          serverMessage.toLowerCase().includes('not registered')) {
        return {
          success: false,
          status: status,
          message: 'No account found with this email. Please sign up first.',
          errorType: 'account_not_found'
        };
      }
    }
    
    // Use status codes if specific message not found
    if (status === 404) {
      return {
        success: false,
        status: status,
        message: 'No account found with this email. Please sign up first.',
        errorType: 'account_not_found'
      };
    }
    
    // For 401 errors assume wrong password
    if (status === 401) {
      return {
        success: false,
        status: status,
        message: 'Incorrect password. Please try again.',
        errorType: 'wrong_password'
      };
    }
    
    // Default error message
    return {
      success: false,
      status: status,
      message: serverMessage || 'Authentication failed. Please try again.',
      errorType: 'general_error'
    };
  }
}

// Concrete implementation for JobSeeker authentication
class JobSeekerAuthenticator extends BaseAuthenticator {
  constructor() {
    super();
  }
  
  async login(credentials) {
    return this.#handleLogin(credentials, 'jobseeker');
  }
  
  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }
  
  // Private method using the # syntax (ES2020)
  async #handleLogin(credentials, expectedRole) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the enhanced error analyzer method
        return this.analyzeAuthError(credentials.email, response.status, data.message);
      }

      // Verify if the user has the correct role
      if (data.user.role !== 'jobseeker') {
        return {
          success: false,
          status: 403,
          message: 'This account is not a job seeker account. Please use the Employer login page.',
          errorType: 'wrong_role'
        };
      }

      // Store user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      
      // Store user data with proper ID format
      const userData = {
        ...data.user,
        _id: data.user.id // Convert id to _id for consistency
      };
      localStorage.setItem('user', JSON.stringify(userData));

      return {
        success: true,
        user: userData
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        message: error.message || 'An error occurred during login.',
        errorType: 'connection_error'
      };
    }
  }
}

// Concrete implementation for Employer authentication
class EmployerAuthenticator extends BaseAuthenticator {
  constructor() {
    super();
  }
  
  async login(credentials) {
    return this.#handleLogin(credentials, 'employer');
  }
  
  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }
  
  // Private method using the # syntax (ES2020)
  async #handleLogin(credentials, expectedRole) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the enhanced error analyzer method
        return this.analyzeAuthError(credentials.email, response.status, data.message);
      }

      // Verify if the user has the correct role
      if (data.user.role !== 'employer') {
        return {
          success: false,
          status: 403,
          message: 'This account is not an employer account. Please use the JobSeeker login page.',
          errorType: 'wrong_role'
        };
      }

      // Store user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      
      // Store user data with proper ID format
      const userData = {
        ...data.user,
        _id: data.user.id // Convert id to _id for consistency
      };
      localStorage.setItem('user', JSON.stringify(userData));

      return {
        success: true,
        user: userData
      };
    } catch (error) {
      return {
        success: false,
        status: 500,
        message: error.message || 'An error occurred during login.',
        errorType: 'connection_error'
      };
    }
  }
}

// The Factory class that creates authenticators
class AuthFactory {
  static getAuthenticator(role) {
    switch (role) {
      case 'jobseeker':
        return new JobSeekerAuthenticator();
      case 'employer':
        return new EmployerAuthenticator();
      default:
        throw new Error(`Unsupported role: ${role}`);
    }
  }
  
  // Utility methods for common authentication tasks
  static isAuthenticated() {
    return !!localStorage.getItem('token');
  }
  
  static getUserRole() {
    return localStorage.getItem('userRole');
  }
  
  static getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  
  static clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }
}

export default AuthFactory;