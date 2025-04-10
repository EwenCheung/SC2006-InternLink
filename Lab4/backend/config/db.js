import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB is already connected');
        return mongoose.connection;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            dbName: 'Users' // Use Users as default database
        });

        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Initialize only required databases
        const usersDb = mongoose.connection.useDb('Users');
        const jobListDb = mongoose.connection.useDb('job_list');
        const filesDb = mongoose.connection.useDb('Files');
        
        // Log initialized databases for verification
        console.log('Active databases:', {
            users: Object.keys(usersDb.collections),
            jobList: Object.keys(jobListDb.collections),
            files: Object.keys(filesDb.collections)
        });

        // Add connection event listeners
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
        });

        // Return the connection for GridFS initialization
        return conn.connection;

    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during MongoDB disconnection:', err);
        process.exit(1);
    }
});

export default connectDB;
