import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ServiceResponse } from '@utils/http/service-response.util.js';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';
import { env } from '@config/env.schema.js';
import { requestLogger } from '@utils/logger.util.js';
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

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return 'Unknown error';
}

function getErrorStack(err: unknown): string | undefined {
  if (err instanceof Error) return err.stack;
  return undefined;
}

function getErrorName(err: unknown): string {
  if (err instanceof Error) return err.name;
  return 'Error';
}

// Centralized middleware for handling all errors.
export const errorHandlerMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  const message = getErrorMessage(err);
  const name = getErrorName(err);
  const stack = getErrorStack(err);

  // Usar requestLogger para incluir correlation ID en el log
  requestLogger.error(req, `Error: ${name}`, {
    message,
    statusCode: err instanceof ApiError ? err.statusCode : 500,
    ...(env.isDevelopment && stack && { stack }),
  });

  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let responseMessage: string = 'Internal server error';
  let errorDetails: ValidationErrorDetail[] | null = null;
  let responseObject: ErrorResponseObject | null = null;

  // Handle Operational Errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    responseMessage = err.message;
  }
  // Handle Zod Errors
  else if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    responseMessage = 'Validation failed';
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    // Log específico para errores de validación
    requestLogger.warn(req, 'Validation error', {
      validationErrors: err.issues.length,
      details: errorDetails.map((d) => `${d.path}: ${d.message}`),
    });
  }
  // Handle JWT Errors
  else if (name === 'JsonWebTokenError' || name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    responseMessage = 'Invalid or expired token';
  }
  // Handle Generic (Unexpected) Errors (500)
  else {
    if (env.isDevelopment) {
      responseMessage = message || 'Unknown Server Error';
    }
  }

  // Construir objeto de respuesta incluyendo correlation ID
  const baseResponse: Record<string, unknown> = {
    requestId: req.id, // Incluir correlation ID en todas las respuestas de error
  };

  if (env.isDevelopment) {
    responseObject = {
      stack: stack ?? null,
      details: errorDetails,
      ...baseResponse,
    };
  } else if (errorDetails) {
    responseObject = {
      details: errorDetails,
      ...baseResponse,
    };
  } else {
    responseObject = baseResponse;
  }

  const serviceResponse = ServiceResponse.failure(responseMessage, responseObject, statusCode);

  // Headers ya están seteados en requestIdMiddleware
  res.status(statusCode).json(serviceResponse);
};
