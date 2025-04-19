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

// Modified port selection for cloud compatibility
const getPort = async () => {
  // For cloud environments, always use the environment-provided PORT without checking availability
  if (process.env.PORT) {
    console.log(`Using environment-provided port: ${process.env.PORT}`);
    return parseInt(process.env.PORT, 10);
  }
  
  // For local development, always use port 5001
  const preferredPort = 5001;
  
  const isPortAvailable = (port) => {
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

  // In local development, check if port 5001 is available
  if (!(await isPortAvailable(preferredPort))) {
    console.error(`\x1b[31m%s\x1b[0m`, `
=======================================================================
ERROR: Port ${preferredPort} is already in use!
This application requires port ${preferredPort} to function properly.

Please:
1. Close any other applications using port ${preferredPort}
2. Restart this server
=======================================================================
`);
    process.exit(1); // Exit if port 5001 is not available
  }
  
  return preferredPort; // Always return 5001 for local development
};

// Middleware
// Configure CORS to be very permissive for troubleshooting
app.use((req, res, next) => {
  // Allow all origins for troubleshooting
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// Standard CORS middleware as a backup
app.use(cors({ 
  origin: '*',  // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

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
      res.send('InternLink API is running');
    });
    
    // Add a health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'ok', 
        message: 'Backend is running', 
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    });
    
    app.use('/api/auth', authUserRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/applications', applicationRoutes);
    app.use('/api/messages', messageRoutes);
    
    // Error handler middleware
    app.use(errorHandlerMiddleware);
    
    // Get the port using our cloud-compatible function
    const port = await getPort();
    
    // Add an error handler for port-in-use errors, particularly important in cloud environments
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. This is likely due to a port conflict in the deployment environment.`);
        // In cloud environments, we'll try to use a random port as a last resort
        if (process.env.PORT) {
          const randomPort = Math.floor(Math.random() * (65535 - 1024) + 1024);
          console.log(`Attempting to use alternative port ${randomPort}...`);
          app.listen(randomPort, '0.0.0.0', () => {
            console.log(`Server is now running on alternative port ${randomPort}`);
          });
        } else {
          // For local dev, just exit
          process.exit(1);
        }
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
    
    // Only write port to file in development environment
    try {
      if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
        const fs = await import('fs');
        fs.writeFileSync('./port.txt', port.toString());
        console.log(`Port ${port} written to port.txt for local development`);
      } else {
        console.log('Skipping port.txt write in production environment');
      }
    } catch (error) {
      console.warn('Could not write port to file:', error.message);
    }
    
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


