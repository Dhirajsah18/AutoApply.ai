import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    const maskedUri = (ENV.MONGODB_URI || '').replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
    console.error(`[MongoDB] Connection error:`, error.message);
    console.warn(`[MongoDB] App will run in degraded mode if MongoDB is not reachable. Target URI: ${maskedUri}`);
  }
};
