import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@config/env.schema.js';
import { createLimiter } from '@/core/middlewares/rate-limiter.middleware.js';
import { errorHandlerMiddleware } from '@/core/middlewares/error-handler.middleware.js';
import { openAPIRouter } from '@/core/docs/openapi/openapi-router.js';
import { notFoundMiddleware } from '@/core/middlewares/not-found.middleware.js';
import routes from '@routes/index.js';
import { requestIdMiddleware } from '@/core/middlewares/request-id.middleware.js';
import { httpLoggerMiddleware } from '@/core/utils/logger.util.js';
import { responseWrapperMiddleware } from '@/core/middlewares/response-wrapper.middleware.js';
import { healthRouter } from '@/modules/health/routes/health.route.js';

const app = express();

app.set('trust proxy', 1);

// Request ID middleware - DEBE IR PRIMERO
app.use(requestIdMiddleware);

app.use(responseWrapperMiddleware);

// HTTP Logger - Después del request ID
app.use(httpLoggerMiddleware);

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true })); // CORS_ORIGIN is string[]
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(createLimiter());

// Register module routes
app.use('/api', routes);
app.use('/health', healthRouter);

// Swagger UI
app.use(openAPIRouter);

// 404 handler (must be after all routes)
app.use(notFoundMiddleware);

// Error Handler
app.use(errorHandlerMiddleware);

export default app;
