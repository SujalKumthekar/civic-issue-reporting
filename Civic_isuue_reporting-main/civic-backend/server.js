import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import illegalRoutes from './routes/illegalRoutes.js';
import actionPointRoutes from './routes/actionPointRoutes.js';
import fundRequestRoutes from './routes/fundRequestRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import completionRoutes from './routes/completionRoutes.js';
import issueTrackingRoutes from './routes/issueTrackingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { initializeBlockchain } from './utils/blockchainService.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Initialize blockchain
initializeBlockchain().then(() => {
  console.log('Blockchain service initialized');
}).catch((error) => {
  console.error('Blockchain initialization failed:', error);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/issue-tracking', issueTrackingRoutes);
app.use('/api/illegal', illegalRoutes);
app.use('/api/action-points', actionPointRoutes);
app.use('/api/funds', fundRequestRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/completions', completionRoutes);
app.use('/api/upload', uploadRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('CivicConnect API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
