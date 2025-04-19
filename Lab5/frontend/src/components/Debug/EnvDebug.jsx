import React, { useEffect, useState } from 'react';

// Simple debug component to check environment variables
const EnvDebug = () => {
  const [apiUrl, setApiUrl] = useState('');
  
  useEffect(() => {
    // Log all environment variables for debugging
    console.log('All env vars:', import.meta.env);
    
    // Set the API URL for display
    setApiUrl(import.meta.env.VITE_API_BASE_URL || 'Not defined');
  }, []);
  
  return (
    <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px', border: '1px solid #ccc' }}>
      <h3>Environment Debug Info</h3>
      <p><strong>API URL:</strong> {apiUrl}</p>
      <p><strong>Production:</strong> {import.meta.env.PROD ? 'Yes' : 'No'}</p>
      <p><strong>Development:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default EnvDebug;