import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error:`, error.message);
    console.warn(`[MongoDB] App will run in degraded/mock mode if MongoDB is not reachable locally. Ensure MongoDB is running on ${ENV.MONGODB_URI}`);
  }
};
