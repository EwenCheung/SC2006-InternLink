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
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code (node_modules) into chunks by package
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['@mui/material', '@emotion/react', '@emotion/styled', 'framer-motion'],
            'vendor-icons': ['react-icons', 'lucide-react'],
            'vendor-maps': ['leaflet', 'react-leaflet'],
            'vendor-utils': ['axios', 'clsx', 'tailwind-merge']
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Increased from default 500kb
    },
    server: {
      port,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false
        },
        '/use-token': {
          target: process.env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false
        }
      },
      onListening: () => {
        console.log(`Frontend running on port ${port}`);
        console.log(`API Proxy target: ${process.env.VITE_API_BASE_URL}`);
      },
    }
  };
});
