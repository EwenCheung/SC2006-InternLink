import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import 'express-async-errors';

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

// Connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();

    // Routes
    app.use('/api/auth', authUserRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/applications', applicationRoutes);

    // Error handler middleware
    app.use(notFound);
    app.use(errorHandler);

    const port = process.env.PORT || 5001;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
