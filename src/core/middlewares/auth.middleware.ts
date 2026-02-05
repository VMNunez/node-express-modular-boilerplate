import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '@core/middlewares/error-handler.middleware.js';
import { jwtUtil } from '@core/auth/jwt.util.js';

/**
 * Security: Maximum allowed token size (8KB).
 * Prevents memory-exhaustion DoS attacks using maliciously oversized JWTs.
 * Standard JWTs are typically much smaller than 1KB.
 */
const MAX_TOKEN_SIZE = 8192; // 8KB

/**
 * Authentication Middleware.
 * Validates the 'Authorization: Bearer <token>' header.
 * If valid, attaches the decoded payload to 'req.user' and proceeds.
 * Otherwise, forwards an unauthorized error to the global error handler.
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // Extract token from 'Bearer <token>' format
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return next(ApiError.unauthorized('Authentication required - No token provided'));
  }

  // Defensive check: Validate token length before processing (Parsing cost mitigation)
  if (token.length > MAX_TOKEN_SIZE) {
    return next(ApiError.badRequest('Security violation: Token exceeds maximum allowed size'));
  }

  try {
    /**
     * Verify the signature and expiration of the Access Token.
     * The jwtUtil should handle the secret key internally.
     */
    const payload = jwtUtil.verifyAccessToken(token);

    // Inject user data into the request context for downstream use
    req.user = payload;

    next();
  } catch (error) {
    /**
     * JWT errors (Expired, Malformed, Invalid Signature) are caught here.
     * Passing them to 'next(error)' ensures they are processed by the
     * centralized errorHandlerMiddleware (typically resulting in a 401).
     */
    next(error);
  }
}
