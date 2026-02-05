import { rateLimit } from 'express-rate-limit';
import type { RateLimitRequestHandler } from 'express-rate-limit';

const createLimiter = (
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
): RateLimitRequestHandler => {
  return rateLimit({
    windowMs,
    limit, // Limit each IP to `limit` requests per `windowMs`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
      statusCode: 429,
    },
    // Use req.ip (works correctly with trust proxy configuration)
    keyGenerator: (req) => {
      return req.ip || req.socket.remoteAddress || 'unknown';
    },
    // Skip rate limiting for health checks and metrics (optional endpoints)
    skip: (req) => {
      return req.path === '/health' || req.path.startsWith('/health/');
    },
  });
};

export { createLimiter };
