/**
 * This file provides configuration for API endpoints that works across all environments
 */

// Get the correct API base URL based on the current environment
const getApiBaseUrl = () => {
  // First check if we're in production (Render.com deployment)
  if (import.meta.env.PROD) {
    // Use the full URL without a specific port for Render.com deployments
    return 'https://internlink-backend.onrender.com';
  }
  
  // In development, use the environment variable or fallback to localhost
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
};

// Export a singleton configuration object
const config = {
  apiBaseUrl: getApiBaseUrl()
};

console.log('App config initialized with API URL:', config.apiBaseUrl);

export default config;