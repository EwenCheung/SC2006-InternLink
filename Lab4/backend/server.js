import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios'; // Ensure axios is imported

// Import database connection
import connectDB from './config/db.js';

// Import route files
import authUserRoutes from './routes/authUser.route.js';
import jobRoutes from './routes/job.route.js';
import messageRoutes from './routes/message.route.js';
// import applicationRoutes from './routes/application.route.js';

// Import error handler middleware
import { errorHandler, notFound } from './errors/errorMiddleware.js';

dotenv.config();
let accessToken = null;

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
    // app.use('/api/applications', applicationRoutes);

  
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

const url = "https://www.onemap.gov.sg/api/auth/post/getToken";  // Correct URL

// Prepare the data payload
const data = {
  email: process.env.ONEMAP_EMAIL,  // Ensure this is in your .env file
  password: process.env.ONEMAP_EMAIL_PASSWORD,  // Ensure this is in your .env file
};

// Fetch the token using Axios
axios.post(url, data, {
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(response => {
    // Log the response data to the console
    accessToken = response.data.access_token;
    console.log(response.data);
  })
  .catch(error => {
    // Handle any errors
    console.error('Error:', error.response ? error.response.data : error.message);
  });

startServer();

app.get('/use-token', (req, res) => {
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token not available' });
  }
  res.json({ message: 'Access token is available', token: accessToken });
});
