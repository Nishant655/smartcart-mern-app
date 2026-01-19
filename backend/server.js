// backend/server.js

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

// Core imports
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';

// Route imports
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import couponRoutes from './routes/couponRoutes.js';

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

// CORS - restrict origins in production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) callback(null, true);
      else callback(new Error('CORS not allowed'));
    },
    credentials: true,
  })
);

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/auth', authLimiter);
app.use('/api/orders', rateLimit({ windowMs: 60 * 1000, max: 100 }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/coupons', couponRoutes);

// Basic health check
app.get('/', (req, res) => res.send('✅ SmartCart API is running!'));

// Centralized error handler (should be last middleware)
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  const status = err.status || 500;
  const message = err.message || 'Server error';
  res.status(status).json({ message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SmartCart server running at http://localhost:${PORT}`);
  console.log(`✅ MONGO_URI:`, process.env.MONGO_URI ? 'Loaded' : '❌ NOT FOUND');
});
