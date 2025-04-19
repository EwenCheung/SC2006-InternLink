import { defineConfig, loadEnv } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import net from 'net';
import dotenv from 'dotenv';

// Find next available port
const findPort = async (startPort) => {
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

export default defineConfig(async ({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('Environment mode:', mode);
  console.log('API Base URL:', env.VITE_API_BASE_URL);
  
  const port = await findPort(Number(process.env.PORT));
  
  // Determine if we're in production mode
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    // Define environment variables to be replaced in the client code
    define: {
      // Ensure environment variables are exposed to client-side code
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL)
    },
    server: {
      port,
      host: true,
      open: true,
      // Only use proxy in development mode
      ...(isProduction ? {} : {
        proxy: {
          '/api': {
            target: env.VITE_API_BASE_URL,
            changeOrigin: true,
            secure: false
          }
        }
      }),
      onListening: () => {
        console.log(`Frontend running on port ${port}`);
        console.log(`API Base URL: ${env.VITE_API_BASE_URL}`);
      },
      // Add allowedHosts configuration to solve the blocked request issue
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '.onrender.com' // This wildcard allows all onrender.com subdomains
      ]
    }
  };
});
