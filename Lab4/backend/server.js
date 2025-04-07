import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

// Import database connection
import connectDB from './config/db.js';

// Import route files
import authUserRoutes from './routes/authUser.route.js';
import jobRoutes from './routes/job.route.js';
import messageRoutes from './routes/message.route.js';

// Import error handler middleware
import { errorHandler, notFound } from './errors/errorMiddleware.js';

dotenv.config();
let accessToken = null;

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
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.use('/api/auth', authUserRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/messages', messageRoutes);
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
