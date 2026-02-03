import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '@core/middlewares/error-handler.middleware.js';
import { jwtUtil } from '@core/auth/jwt.util.js';
import type { AuthenticatedUser } from '@/common/types/auth.type.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware that verifies the Authorization: Bearer <token> header
 * and attaches the decoded JWT payload to req.user.
 * Passes JWT errors to the global error handler (401).
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    next(ApiError.unauthorized('Authentication required'));
    return;
  }

  try {
    const payload = jwtUtil.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    // JsonWebTokenError / TokenExpiredError are passed to errorHandlerMiddleware
    next(error);
  }
}
