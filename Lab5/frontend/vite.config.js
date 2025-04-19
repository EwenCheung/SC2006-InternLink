import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import net from 'net';
import dotenv from 'dotenv';

dotenv.config();

// Find next available port
const findPort = async (startPort) => {
  // In production (e.g., Render.com), use the provided port
  if (process.env.NODE_ENV === 'production') {
    return startPort;
  }
  
  // For local development, find an available port
  const test = (port) => {
    return new Promise((resolve) => {
      const server = net.createServer()
        .once('error', () => resolve(false))
        .once('listening', () => {
          server.close();
          resolve(true);
        })
        .listen(port);
    });
  };

  let port = startPort;
  while (!(await test(port))) {
    console.log(`Port ${port} in use, trying ${port + 1}`);
    port++;
  }
  return port;
};

export default defineConfig(async () => {
  const defaultPort = process.env.NODE_ENV === 'production' ? (process.env.PORT || 3000) : 3000;
  const port = await findPort(Number(process.env.PORT || defaultPort));
  
  // Determine API URL based on environment
  let apiUrl = process.env.VITE_API_URL;
  
  // For local development, try to read the backend port from port.txt if VITE_API_URL is not set
  if (!apiUrl && process.env.NODE_ENV !== 'production') {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const portFile = path.resolve('../backend/port.txt');
      
      if (fs.existsSync(portFile)) {
        const backendPort = fs.readFileSync(portFile, 'utf8').trim();
        apiUrl = `http://localhost:${backendPort}`;
        console.log(`Using backend port from port.txt: ${backendPort}`);
      } else {
        apiUrl = 'http://localhost:5001'; // Fallback
        console.log('port.txt not found, using default backend port 5001');
      }
    } catch (error) {
      console.error('Error reading backend port:', error);
      apiUrl = 'http://localhost:5001'; // Fallback
    }
  }
  
  // In production, use the environment variable or the deployed URL
  if (process.env.NODE_ENV === 'production') {
    apiUrl = process.env.VITE_API_URL || 'https://internlink-backend.onrender.com';
  }
  
  console.log(`API URL: ${apiUrl}`);
  
  return {
    plugins: [react()],
    server: {
      port,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false
        }
      },
      onListening: () => {
        console.log(`Frontend running on port ${port}`);
        console.log(`API Proxy target: ${apiUrl}`);
      },
    }
  };
});
