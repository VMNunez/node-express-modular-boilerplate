import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '@core/middlewares/error-handler.middleware.js';

/**
 * Handles requests that do not match any route.
 * Must be registered after all route handlers and before errorHandlerMiddleware.
 */
export function notFoundMiddleware(_req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound('The requested resource was not found'));
}
