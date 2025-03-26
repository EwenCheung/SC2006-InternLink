import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import CORS middleware
import { connectDB } from './config/db.js';
import jobRoutes from './routes/job.route.js';
import { errorHandler, notFound } from './errors/errorMiddleware.js';

dotenv.config();

const app = express();

// Middleware
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5178'; // Default to localhost for development
app.use(cors({
  origin: allowedOrigin, // Use environment variable for origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials: true // Allow cookies and credentials
}));
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use('/api/jobs', jobRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Dynamically Select an Available Port
const DEFAULT_PORT = process.env.PORT || 5000;
const PORT = parseInt(DEFAULT_PORT, 10);

const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`CORS allowed origin: ${allowedOrigin}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);
