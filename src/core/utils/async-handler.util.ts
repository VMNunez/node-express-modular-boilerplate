import type { NextFunction, Request, Response } from 'express';

/**
 * Type definition for async request handlers
 */
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Wrapper for async route handlers that automatically catches errors
 * and passes them to the error handling middleware.
 *
 * This eliminates the need for try-catch blocks in every controller.
 */
export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
