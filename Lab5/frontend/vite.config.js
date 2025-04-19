import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import net from 'net';
import dotenv from 'dotenv';

dotenv.config();

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

export default defineConfig(async () => {
  const port = await findPort(Number(process.env.PORT));
  
  return {
    plugins: [react()],
    server: {
      port,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL,
          changeOrigin: true,
          secure: false
        }
      },
      onListening: () => {
        console.log(`Frontend running on port ${port}`);
        console.log(`API Proxy target: ${process.env.VITE_API_URL}`);
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
