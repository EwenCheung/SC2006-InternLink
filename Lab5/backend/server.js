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
import messageRoutes from './routes/message.route.js';
import skillsRoutes from './routes/skills.route.js';
import universitiesRoutes from './routes/universities.route.js';

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
  const preferredPort = process.env.PORT;
  
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

  // Check if preferred port is available
  if (startPort === preferredPort && !(await test(preferredPort))) {
    console.error('\x1b[31m%s\x1b[0m', `
=======================================================================
ERROR: Port ${preferredPort} is already in use!
This application requires port ${preferredPort} to function properly.

Please:
1. Close any other applications using port ${preferredPort}
2. Restart this server
=======================================================================
`);
    process.exit(1);
  }

  // Don't try other ports, just return the preferred port if it's available
  if (await test(startPort)) {
    return startPort;
  } else {
    console.error('\x1b[31m%s\x1b[0m', `
=======================================================================
ERROR: Port ${startPort} is already in use!
This application requires this port to function properly.

Please:
1. Close any other applications using port ${startPort}
2. Restart this server
=======================================================================
`);
    process.exit(1);
  }
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
    app.use('/api/messages', messageRoutes);
    app.use('/api/skills', skillsRoutes);
    app.use('/api/universities', universitiesRoutes);
    
    // Error handler middleware
    app.use(errorHandlerMiddleware);
    
    // Start the server on the next available port
    const port = await findPort(process.env.PORT );
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    
    // Write port to file for frontend to use
    const fs = await import('fs');
    fs.writeFileSync('./port.txt', port.toString());
    
    console.log('Server initialization complete');
    
    // OneMap token endpoint
    app.get('/use-token', (req, res) => {
      if (!accessToken) {
        return res.status(400).json({ error: 'Access token not available' });
      }
      res.json({ message: 'Access token is available', token: accessToken, token2: accessToken2 });
    });

  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

export default app;
// Fetch EMSI token
const fetchEmsiToken = async () => {
  try {
    const emsiUrl = "https://auth.emsicloud.com/connect/token";
    const emsiData = new URLSearchParams({
      client_id: process.env.Client_ID,
      client_secret: process.env.Secret,
      grant_type: 'client_credentials',
      scope: process.env.Scope,
    });
    
    const response = await axios.post(emsiUrl, emsiData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    accessToken2 = response.data.access_token;
    console.log('EMSI token acquired');
  } catch (error) {
    console.error('Error fetching EMSI token:', error.response ? error.response.data : error.message);
  }
};

// Fetch OneMap token
const fetchOneMapToken = async () => {
  try {
    const url = "https://www.onemap.gov.sg/api/auth/post/getToken";
    const data = {
      email: process.env.ONEMAP_EMAIL,
      password: process.env.ONEMAP_EMAIL_PASSWORD,
    };
    
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    accessToken = response.data.access_token;
    console.log('OneMap token acquired');
  } catch (error) {
    console.error('Error fetching OneMap token:', error.response ? error.response.data : error.message);
  }
};

// Start everything
Promise.all([fetchEmsiToken(), fetchOneMapToken()])
  .then(() => startServer())
  .catch(error => console.error('Startup error:', error));


