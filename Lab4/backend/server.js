import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import jobRoutes from './routes/job.route.js';
import applicationRoutes from './routes/application.route.js';
import messageRoutes from './routes/message.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log(process.env.MONGO_URI);

app.use(express.json()); // allows us to accept JSON data in the req.body

app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/messages", messageRoutes);

app.listen(5000, () => {
    connectDB();
    console.log("Server is running on http://localhost:"+PORT);
});


