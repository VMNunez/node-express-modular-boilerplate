// src/core/utils/logger.util.ts
import pino from 'pino';
import type { NextFunction, Request, Response } from 'express';
import { env } from '@/core/config/env.schema.js';

/**
 * Centralized logger configuration using Pino.
 * Provides high-performance structured logging.
 * - Development: Human-readable logs via pino-pretty.
 * - Production: JSON structured logs for ELK/Datadog/CloudWatch integration.
 */
export const logger = pino({
  // Set log level based on environment
  level: env.isDevelopment ? 'debug' : 'info',

  // Development configuration: Pretty printing
  ...(env.isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),

  // Production configuration: Optimized JSON formatters
  ...(!env.isDevelopment && {
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
  }),
});

/**
 * Context-aware logger for request-specific events.
 * Automatically injects Request ID, HTTP method, URL, and latency (duration).
 */
export const requestLogger = {
  error(req: Request, message: string, meta?: Record<string, unknown>): void {
    logger.error(
      {
        requestId: req.id,
        method: req.method,
        url: req.url,
        duration: req.startTime ? Date.now() - req.startTime : undefined,
        ...meta,
      },
      message,
    );
  },

  warn(req: Request, message: string, meta?: Record<string, unknown>): void {
    logger.warn(
      {
        requestId: req.id,
        method: req.method,
        url: req.url,
        duration: req.startTime ? Date.now() - req.startTime : undefined,
        ...meta,
      },
      message,
    );
  },

  info(req: Request, message: string, meta?: Record<string, unknown>): void {
    logger.info(
      {
        requestId: req.id,
        method: req.method,
        url: req.url,
        duration: req.startTime ? Date.now() - req.startTime : undefined,
        ...meta,
      },
      message,
    );
  },

  debug(req: Request, message: string, meta?: Record<string, unknown>): void {
    logger.debug(
      {
        requestId: req.id,
        method: req.method,
        url: req.url,
        duration: req.startTime ? Date.now() - req.startTime : undefined,
        ...meta,
      },
      message,
    );
  },
};

/**
 * HTTP Middleware that logs request completion details once the response is sent.
 * It automatically calculates latency and categorizes logs by HTTP status code.
 */
export const httpLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Listen for the 'finish' event to log details after headers and body are sent
  res.on('finish', () => {
    const duration = req.startTime ? Date.now() - req.startTime : undefined;

    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration, // Latency in milliseconds
      userAgent: req.get('user-agent'),
      ip: req.ip || req.socket.remoteAddress,
    };

    // Categorize log level based on HTTP response status
    if (res.statusCode >= 500) {
      logger.error(logData, `HTTP ${res.statusCode} - Server Error`);
    } else if (res.statusCode >= 400) {
      logger.warn(logData, `HTTP ${res.statusCode} - Client Error`);
    } else {
      logger.info(logData, `HTTP ${res.statusCode} - Success`);
    }
  });

  next();
};
