import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_automation',
  JWT_SECRET: process.env.JWT_SECRET || 'jwt_secret_job_automation_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // AI Settings
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '',
  AI_PROVIDER: process.env.AI_PROVIDER || 'openai',
  
  // Email Settings
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'mock', // 'smtp' | 'resend' | 'mock'
  EMAIL_FROM: process.env.EMAIL_FROM || 'Career Outreach <careers@jobautomation.app>',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',

  // Storage
  STORAGE_DIR: path.resolve(__dirname, '../../uploads'),
};

if (ENV.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('job_automation_key_2026')) {
    console.warn('⚠️ [SECURITY WARNING]: You are running in PRODUCTION with a default or insecure JWT_SECRET. Please set a strong, random JWT_SECRET in your .env file!');
  }
}

