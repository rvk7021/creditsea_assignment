import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
    try {
        const dbUri = process.env.MONGODB_URL;
        if (!dbUri) throw new Error('MONGODB_URL not defined in .env');
        await mongoose.connect(dbUri);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed');
        console.error(error);
        process.exit(1);
    }
};
