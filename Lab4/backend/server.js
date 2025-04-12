import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

// Import database connection
import mongoose from 'mongoose';
import connectDB from './config/db.js';

// Import route files
import authUserRoutes from './routes/authUser.route.js';
import jobRoutes from './routes/job.route.js';
import applicationRoutes from './routes/application.route.js';

// Import error handler middleware
import errorHandlerMiddleware from './middleware/error-handler.js';

dotenv.config();

// Handle server startup errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});
let accessToken = null;
let accessToken2 = null;

const app = express();

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Middleware
// Configure CORS and request size limits
app.use(cors());  // Allow all origins for development
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    const { connection } = await connectDB();
    
    // Import and initialize models with error handling
    try {
      const [JobSeekerModel, EmployerModel] = await Promise.all([
        import('./models/JobSeeker.model.js'),
        import('./models/Employer.model.js')
      ]);

      // Get Users database instance
      const usersDb = connection.useDb('Users', { useCache: true });

      // Ensure collections exist
      const collections = await usersDb.db.listCollections().toArray();
      const existingCollections = collections.map(col => col.name);

      if (!existingCollections.includes('jobseekers')) {
        await usersDb.createCollection('jobseekers');
        console.log('Created jobseekers collection');
      }

      if (!existingCollections.includes('employers')) {
        await usersDb.createCollection('employers');
        console.log('Created employers collection');
      }

      console.log('Database initialization complete:', {
        connection: connection.readyState === 1 ? 'Connected' : 'Not Connected',
        models: Object.keys(usersDb.models),
      });
      
    } catch (error) {
      console.error('Model initialization error:', error);
      process.exit(1);
    }
    
    // Routes
    app.get('/', (req, res) => {
      res.send('InternLink API');
    });
    
    app.use('/api/auth', authUserRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/applications', applicationRoutes);
    
    // Error handler middleware
    app.use(errorHandlerMiddleware);
    
    // Start the server on the next available port
    const port = await findPort(process.env.PORT || 5001);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    
    // Write port to file for frontend to use
    const fs = await import('fs');
    fs.writeFileSync('./port.txt', port.toString());
    
    console.log('Server initialization complete');
    
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

export default app;
