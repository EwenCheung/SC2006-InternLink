import mongoose from 'mongoose';

let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 3;

// Export connections
export let usersConn = null;
export let jobListConn = null;

export const getConnectionStatus = () => isConnected;

export const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB is already connected');
        return;
    }

    try {
        console.log('Attempting to connect to MongoDB...');
        
        // Connect to Users database
        const users = await mongoose.createConnection('mongodb+srv://yiwencheung:eM9nvJHPsMj1flko@cluster0.nbwm6.mongodb.net/Users?retryWrites=true&w=majority&appName=Cluster0', {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        // Connect to job_list database
        const jobs = await mongoose.createConnection('mongodb+srv://yiwencheung:eM9nvJHPsMj1flko@cluster0.nbwm6.mongodb.net/job_list?retryWrites=true&w=majority&appName=Cluster0', {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        // Assign to exported variables
        usersConn = users;
        jobListConn = jobs;

        isConnected = true;
        connectionRetries = 0;
        console.log(`MongoDB Users Connected: ${users.host}`);
        console.log(`MongoDB Job List Connected: ${jobs.host}`);

        // Add connection event listeners for both databases
        users.on('disconnected', () => {
            console.log('MongoDB Users database disconnected');
            isConnected = false;
        });

        users.on('error', (err) => {
            console.error('MongoDB Users database connection error:', err);
            isConnected = false;
        });

        jobs.on('disconnected', () => {
            console.log('MongoDB Job List database disconnected');
            isConnected = false;
        });

        jobs.on('error', (err) => {
            console.error('MongoDB Job List database connection error:', err);
            isConnected = false;
        });

    } catch (error) {
        isConnected = false;
        connectionRetries++;
        
        console.error(`MongoDB connection attempt ${connectionRetries} failed:`, error.message);
        
        if (connectionRetries < MAX_RETRIES) {
            console.log(`Retrying connection in 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return connectDB();
        }
        
        console.error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts`);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await usersConn?.close();
        await jobListConn?.close();
        console.log('MongoDB connections closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during MongoDB disconnection:', err);
        process.exit(1);
    }
});
