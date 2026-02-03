import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@config/env.schema.js';
import { createLimiter } from '@/core/middlewares/rate-limiter.middleware.js';
import { errorHandlerMiddleware } from '@/core/middlewares/error-handler.middleware.js';
import { openAPIRouter } from '@/core/docs/openapi/openapi-router.js';
import { notFoundMiddleware } from '@/core/middlewares/not-found.middleware.js';
import routes from '@routes/index.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true })); // CORS_ORIGIN is string[]
app.use(helmet());
app.use(createLimiter());

// Register module routes
app.use('/api', routes);

// Swagger UI
app.use(openAPIRouter);

// 404 handler (must be after all routes)
app.use(notFoundMiddleware);

// Error Handler
app.use(errorHandlerMiddleware);

export default app;
