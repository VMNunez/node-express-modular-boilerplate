import { rateLimit } from 'express-rate-limit';
import type { RateLimitRequestHandler } from 'express-rate-limit';

const createLimiter = (limit: number = 100): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests, please try again later.',
  });
};

export { createLimiter };
