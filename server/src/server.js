import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || ENV.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running in ${ENV.NODE_ENV} mode on port ${PORT}`);
    console.log(`[API Base] http://localhost:${PORT}/api`);
    console.log(`[Database] Connecting to MongoDB...`);
    console.log(`[AI Provider] ${ENV.AI_PROVIDER}`);
    console.log(`[Email Provider] ${ENV.EMAIL_PROVIDER}`);
  });
};

startServer();
