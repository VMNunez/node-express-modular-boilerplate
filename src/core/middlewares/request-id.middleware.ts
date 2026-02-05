import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Safely extracts a header value, handling both string and array cases
 */
function getHeaderValue(header: string | string[] | undefined): string | undefined {
  if (Array.isArray(header)) {
    return header[0]; // Use first value if array
  }
  return header;
}

/**
 * Validates that a request ID is a valid UUID format (optional validation)
 * For now, we accept any non-empty string, but this can be tightened if needed
 */
function isValidRequestId(id: string): boolean {
  // Basic validation: non-empty string, reasonable length
  // UUIDs are 36 characters, but we allow some flexibility
  return typeof id === 'string' && id.length > 0 && id.length <= 200;
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Safely extract headers (handles both string and array cases)
  const requestIdHeader = getHeaderValue(req.headers['x-request-id']);
  const correlationIdHeader = getHeaderValue(req.headers['x-correlation-id']);

  // Use existing request ID if valid, otherwise generate new one
  const existingRequestId = requestIdHeader || correlationIdHeader;
  req.id =
    existingRequestId && isValidRequestId(existingRequestId) ? existingRequestId : randomUUID();

  req.startTime = Date.now();
  res.setHeader('X-Request-Id', req.id);
  res.setHeader('X-Correlation-Id', req.id);
  next();
};
