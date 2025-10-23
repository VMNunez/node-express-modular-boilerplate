import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { ZodError, z } from 'zod';
import { errorHandlerMiddleware, ApiError } from '@middlewares/error-handler.middleware.js';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';
import { env } from '@core/config/env.schema.js';

describe('errorHandlerMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let statusSpy: ReturnType<typeof vi.fn>;
  let jsonSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Force development mode to verify stack traces
    vi.spyOn(env, 'isDevelopment', 'get').mockReturnValue(true);

    mockReq = { method: 'GET', originalUrl: '/test' };
    statusSpy = vi.fn().mockReturnThis();
    jsonSpy = vi.fn();
    mockRes = {
      status: statusSpy,
      json: jsonSpy,
    };
    mockNext = vi.fn();
  });

  // Test section for Generic Errors in development environment

  it('should use original error message in development for generic errors', () => {
    // Re-ensure development mode is set
    vi.spyOn(env, 'isDevelopment', 'get').mockReturnValue(true);

    const error = new Error('Database connection timeout');

    errorHandlerMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    // Expect 500 status and the original message in the JSON body
    expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'Database connection timeout', // Original message expected in development
      responseObject: {
        stack: expect.any(String),
        details: null,
      },
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  });

  it('should use "Unknown Server Error" when error message is empty in development', () => {
    // Re-ensure development mode is set
    vi.spyOn(env, 'isDevelopment', 'get').mockReturnValue(true);

    const error = new Error(''); // Empty message error

    errorHandlerMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    // Expect 500 status and the fallback message
    expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'Unknown Server Error',
      responseObject: {
        stack: expect.any(String),
        details: null,
      },
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  });

  it('should hide sensitive details in Production Mode', () => {
    // Force production mode
    vi.spyOn(env, 'isDevelopment', 'get').mockReturnValue(false);
    vi.spyOn(env, 'NODE_ENV', 'get').mockReturnValue('production');
    vi.spyOn(env, 'isProduction', 'get').mockReturnValue(true);

    // Use a generic 500 error for the test
    const error = new Error('Database connection failed');

    errorHandlerMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    // Verify 500 status
    expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);

    // Verify JSON body in production mode
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      // In production, the message is generic
      message: 'Internal server error',
      // Stack and details should be NULL
      responseObject: null,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  });
  // Handled Errors (ApiError)

  it('should handle ApiError.notFound correctly (404 Not Found)', () => {
    const error = ApiError.notFound('Resource missing');

    errorHandlerMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    // Verify 404 status and message
    expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'Resource missing',
      responseObject: {
        stack: expect.any(String),
        details: null,
      },
      statusCode: HTTP_STATUS.NOT_FOUND,
    });
  });

  it('should handle ApiError.badRequest correctly (400 Bad Request)', () => {
    const error = ApiError.badRequest('Invalid input');

    errorHandlerMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    // Verify 400 status and correct message
    expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid input',
      responseObject: {
        stack: expect.any(String),
        details: null,
      },
      statusCode: HTTP_STATUS.BAD_REQUEST,
    });
  });

  it('should handle ApiError.unauthorized correctly (401 Unauthorized)', () => {
    const error = ApiError.unauthorized('Authentication failed');

    errorHandlerMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    // Verify 401 status and message
    expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication failed',
      responseObject: {
        stack: expect.any(String),
        details: null,
      },
      statusCode: HTTP_STATUS.UNAUTHORIZED,
    });
  });

  it('should handle ApiError.forbidden correctly (403 Forbidden)', () => {
    const error = ApiError.forbidden('Access denied');

    errorHandlerMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    // Verify 403 status and message
    expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'Access denied',
      responseObject: {
        stack: expect.any(String),
        details: null,
      },
      statusCode: HTTP_STATUS.FORBIDDEN,
    });
  });

  //  Authentication Errors (

  it('should handle JWT related errors correctly (401 Unauthorized)', () => {
    const error = new Error('jwt malformed');
    // Simulate the error name for JWT
    error.name = 'JsonWebTokenError';

    errorHandlerMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

    // Expect 401 Unauthorized status
    expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);

    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid or expired token',
      responseObject: {
        stack: expect.any(String),
        details: null,
      },
      statusCode: HTTP_STATUS.UNAUTHORIZED,
    });
  });

  // Validation Errors

  it('should handle ZodError correctly in Development (Validation Error)', () => {
    // Simulate a Zod validation error
    const schema = z.object({ id: z.string() });
    let zodError: ZodError | null = null;
    try {
      schema.parse({ id: 123 }); // This will throw ZodError
    } catch (e) {
      if (e instanceof ZodError) {
        zodError = e;
      }
    }

    if (!zodError) throw new Error('Failed to create ZodError mock');

    errorHandlerMiddleware(zodError, mockReq as Request, mockRes as Response, mockNext);

    // Verify 422 Unprocessable Entity status
    expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);

    // Verify JSON body includes stack and details array
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed',
      responseObject: {
        stack: expect.any(String), // Stack trace present in development
        details: expect.arrayContaining([
          expect.objectContaining({ path: expect.any(String), message: expect.any(String) }),
        ]),
      },
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    });
  });

  it('should handle ZodError in Production mode, only returning details', () => {
    // Force production mode
    vi.spyOn(env, 'isDevelopment', 'get').mockReturnValue(false);
    vi.spyOn(env, 'NODE_ENV', 'get').mockReturnValue('production');
    vi.spyOn(env, 'isProduction', 'get').mockReturnValue(true);
    // Simulate a Zod validation error
    const schema = z.object({ id: z.string() });
    let zodError: ZodError | null = null;
    try {
      schema.parse({ id: 123 });
    } catch (e) {
      if (e instanceof ZodError) {
        zodError = e;
      }
    }

    if (!zodError) throw new Error('Failed to create ZodError mock');

    errorHandlerMiddleware(zodError, mockReq as Request, mockRes as Response, mockNext);

    // Verify 422 Unprocessable Entity status
    expect(statusSpy).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);

    // Verify JSON body: only details (no stack)
    expect(jsonSpy).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed',
      responseObject: {
        // In production, only validation details are exposed
        details: expect.arrayContaining([
          expect.objectContaining({ path: expect.any(String), message: expect.any(String) }),
        ]),
      },
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    });
  });
});
