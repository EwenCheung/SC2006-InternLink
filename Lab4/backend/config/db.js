import mongoose from 'mongoose';

let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 3;

export const getConnectionStatus = () => isConnected;

export const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB is already connected');
        return;
    }

    try {
        console.log('Attempting to connect to MongoDB...');
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            socketTimeoutMS: 45000, // 45 second timeout
        });

        isConnected = true;
        connectionRetries = 0;
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Add connection event listeners
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
            isConnected = false;
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
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
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during MongoDB disconnection:', err);
        process.exit(1);
    }
});
