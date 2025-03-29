import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB is already connected');
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://yongfushan:123456!@cluster0.tmwlym4.mongodb.net/InternLink?retryWrites=true&w=majority', {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Get connection to database
        const db = mongoose.connection.db;
        
        // Let MongoDB create collections automatically when documents are inserted
        // This avoids collection creation conflicts with existing collections
        
        // Initialize database connections for models to use
        const usersDb = mongoose.connection.useDb('Users', { useCache: true });
        const jobListDb = mongoose.connection.useDb('job_list', { useCache: true });

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
