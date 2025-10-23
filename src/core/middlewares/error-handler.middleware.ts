import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ServiceResponse } from '@utils/http/service-response.util.js';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';
import { env } from '@config/env.schema.js';
import type {
  ValidationErrorDetail,
  ErrorResponseObject,
} from '@/common/types/api-response.type.js';

// This class defines all controlled, expected errors in the application.
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean; // Marks the error as controlled (expected), preventing 500 treatment.

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor); // Capture stack trace for better debugging
  }

  // Static factory methods
  static notFound(message = 'Resource not found') {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static badRequest(message = 'Invalid request parameters') {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Access to this resource is forbidden') {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static conflict(message = 'Resource already exists') {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }
}

// Centralized middleware for handling all errors.
export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  // Always log errors
  console.error(`[${req.method}] ${req.originalUrl}`, {
    name: err.name,
    message: err.message,
    ...(env.isDevelopment && { stack: err.stack }), // show stack only in dev
  });

  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = 'Internal server error';
  let errorDetails: ValidationErrorDetail[] | null = null;
  let responseObject: ErrorResponseObject | null = null;

  // Handle Operational Errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Zod Errors
  else if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = 'Validation failed';

    // Map Zod issues to a readable structure
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  }
  // Handle JWT Errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid or expired token';
  }
  // Handle Generic (Unexpected) Errors (500)
  else {
    // Show actual error message in development for debugging
    if (env.isDevelopment) {
      message = err.message || 'Unknown Server Error';
    }
    // If production, 'Internal server error' remains the message
  }

  // Build the response

  // Include stack trace and details in development
  if (env.isDevelopment) {
    responseObject = { stack: err.stack, details: errorDetails };
  } else if (errorDetails) {
    // Only include non-sensitive details in production
    responseObject = { details: errorDetails };
  } else {
    responseObject = null;
  }

  // Use ServiceResponse.failure to format the output
  const serviceResponse = ServiceResponse.failure(message, responseObject, statusCode);

  // Send the formatted response
  res.status(statusCode).json(serviceResponse);
};
