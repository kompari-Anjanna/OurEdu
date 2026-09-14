import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '../backend/.env' });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// TODO: Import and use your backend routes here
// Example:
// import authRoutes from '../backend/routes/auth.js';
// app.use('/api/auth', authRoutes);

export default app;
