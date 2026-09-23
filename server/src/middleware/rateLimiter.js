import rateLimit from 'express-rate-limit';

// Standard rate limit handler
const createLimiterMessage = (message) => ({
  success: false,
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message,
  },
});

// 1. Dedicated Authentication Limiter (Prevents brute-force / credential stuffing)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterMessage('Too many authentication attempts. Please try again after 15 minutes.'),
});

// 2. Application Outreach & Send Limiter (Prevents rapid automated spamming)
export const sendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 send/batch actions per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterMessage('Application send rate limit reached. Please wait a few minutes before sending more applications.'),
});

// 3. AI Generation Limiter (Controls LLM tokens & API costs)
export const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 40, // 40 AI generation requests per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterMessage('AI generation rate limit reached. Please slow down and try again in a few minutes.'),
});

// 4. General Global API Limiter (DDoS and flood defense)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // 600 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterMessage('Too many API requests. Please slow down and try again later.'),
});
