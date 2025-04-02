import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import 'express-async-errors';
import net from 'net';

// Import database connection
import connectDB from './config/db.js';

// Import route files
import authUserRoutes from './routes/authUser.route.js';
import jobRoutes from './routes/job.route.js';
import messageRoutes from './routes/message.route.js';
import applicationRoutes from './routes/application.route.js';

// Import error handler middleware
import { errorHandler, notFound } from './errors/errorMiddleware.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Function to check if a port is in use
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
};

// Find next available port
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (await isPortInUse(port)) {
    port++;
  }
  return port;
};

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    // API routes
    app.use('/api/auth', authUserRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/applications', applicationRoutes);

    // Error handler middleware
    app.use(notFound);
    app.use(errorHandler);

    // Find available port starting from preferred port
    const preferredPort = process.env.PORT || 5000;
    const port = await findAvailablePort(preferredPort);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API base URL: /api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
