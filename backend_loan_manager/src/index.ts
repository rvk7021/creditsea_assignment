import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/user'; // adjust path as needed
import { connectDB } from './utils/database';
import cors  from 'cors';
import cookieParser from 'cookie-parser'; 

dotenv.config();
connectDB(); // Connect to DB
const app = express();
app.use(cors({
  origin: 'http://localhost:3000'
})); 

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser()); 

// Use router here
app.use('/api', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  connectDB(); // Connect to DB once server starts
});
