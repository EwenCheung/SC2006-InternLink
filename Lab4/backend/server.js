import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

// Import database connection and GridFS
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { initGridFS } from './config/gridfs.js';

// Import route files
import authUserRoutes from './routes/authUser.route.js';
import jobRoutes from './routes/job.route.js';
import messageRoutes from './routes/message.route.js';
import applicationRoutes from './routes/application.route.js';

// Import error handler middleware
import { errorHandler, notFound } from './errors/errorMiddleware.js';

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
    // Connect to MongoDB
    const conn = await connectDB();
    
    // Import and initialize models in correct order
    const { default: gridfsModels } = await import('./models/GridFSModel.js');
    await initGridFS();
    
    // Import user models after GridFS initialization
    await Promise.all([
      import('./models/JobSeeker.model.js'),
      import('./models/Employer.model.js')
    ]);

    // Verify we're using the correct databases
    console.log('Connected databases:', 
      Object.keys(mongoose.connection.useDb('Users').db.collections),
      Object.keys(mongoose.connection.useDb('Files').db.collections)
    );
    
    // Initialize routes after all models are loaded
    app.use('/api/auth', authUserRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/applications', applicationRoutes);

    // OneMap token endpoint
    app.get('/use-token', (_, res) => {
      if (accessToken) {
        res.json({ token: `Bearer ${accessToken}` });
      } else {
        res.status(500).json({ error: 'OneMap token not yet available' });
      }
    });
    app.use(notFound);
    app.use(errorHandler);

    const port = await findPort(process.env.PORT);
    app.listen(port, () => console.log(`Backend running on port ${port}`));
  } catch (error) {
    console.error('Server failed:', error);
    process.exit(1);
  }
};

// Get OneMap token
const getOnemapToken = async () => {
  try {
    const response = await axios.post(
      "https://www.onemap.gov.sg/api/auth/post/getToken",
      {
        email: process.env.ONEMAP_EMAIL,
        password: process.env.ONEMAP_EMAIL_PASSWORD,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    accessToken = response.data.access_token;
    console.log('OneMap token acquired');
  } catch (error) {
    console.error('OneMap token error:', error.message);
  }
};

// Start everything
Promise.all([startServer(), getOnemapToken()])
  .catch(error => console.error('Startup error:', error));


// Fetch EMSI token
const emsiUrl = "https://auth.emsicloud.com/connect/token";

// Prepare the data payload
const emsiData = new URLSearchParams({
  client_id: process.env.Client_ID,
  client_secret: process.env.Secret,
  grant_type: 'client_credentials',
  scope: process.env.Scope,
});

// Fetch the token using Axios
const fetchEmsiToken = async () => {
  try {
    const response = await axios.post(emsiUrl, emsiData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    accessToken2 = response.data.access_token;
  } catch (error) {
    console.error('Error fetching EMSI token:', error.response ? error.response.data : error.message);
  }
};
await fetchEmsiToken();

  
const url = "https://www.onemap.gov.sg/api/auth/post/getToken";  // Correct URL

// Prepare the data payload
const data = {
  email: process.env.ONEMAP_EMAIL,  // Ensure this is in your .env file
  password: process.env.ONEMAP_EMAIL_PASSWORD,  // Ensure this is in your .env file
};
