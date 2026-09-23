import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import {
  authLimiter,
  aiLimiter,
  generalLimiter,
} from './middleware/rateLimiter.js';
import { startQueueWorker } from './services/emailQueueService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// HTTP Response Compression (Gzip/Brotli) to speed up JSON payload transfer by 70-80%
app.use(compression());

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(morgan('dev'));

// 1. Dedicated rate limiting for authentication
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 2. Dedicated rate limiting for AI generation
app.use('/api/ai', aiLimiter);

// 3. Global general rate limiting for all other API endpoints
app.use('/api/', generalLimiter);

// Health check endpoint (used for keep-alive heartbeat and cold-start monitoring)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'AI Job Application Automation API is running smoothly',
    timestamp: new Date(),
    uptime: Math.round(process.uptime()),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Launch background email queue worker
startQueueWorker();

export default app;
