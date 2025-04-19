import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portFilePath = path.join(__dirname, '..', '..', 'port.json');

export const writePortToFile = (port) => {
  // Skip writing port file in cloud environments
  if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    console.log('Skipping port file write in production environment');
    return;
  }
  
  try {
    fs.writeFileSync(portFilePath, JSON.stringify({ backendPort: port }));
    console.log(`Port ${port} written to port.json file for local development`);
  } catch (error) {
    console.error('Error writing port to file:', error);
  }
};

export const readPortFromFile = () => {
  // In cloud environments, prioritize environment variables
  if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    return process.env.PORT || null;
  }
  
  try {
    if (fs.existsSync(portFilePath)) {
      const data = fs.readFileSync(portFilePath);
      return JSON.parse(data).backendPort;
    }
  } catch (error) {
    console.error('Error reading port from file:', error);
  }
  return null;
};

// Helper function to get API base URL (for use in frontend)
export const getApiBaseUrl = () => {
  if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    // Use the backend service URL in production
    return process.env.BACKEND_URL || 'https://internlink-backend.onrender.com';
  }
  
  // For local development
  const port = readPortFromFile() || 5001;
  return `http://localhost:${port}`;
};
