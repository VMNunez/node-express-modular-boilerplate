import { describe, it, expect } from 'vitest';
import {
  HealthSuccessResponseSchema,
  HealthDegradedResponseSchema,
  HealthSucessDataSchema,
  HealthDegradedDataSchema,
} from '@/modules/health/schemas/health-response.schema.js';
import { ErrorResponseSchema } from '@/common/schemas/api-response.schema.js';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';

describe('HealthCheck Schemas', () => {
  const mockTimestamp = '2025-10-01T14:01:55.573Z';

  describe('Health Data Schemas', () => {
    // Verifies the schema for the healthy data object itself
    it('should validate healthy data', () => {
      const result = HealthSucessDataSchema.safeParse({
        status: 'healthy',
        timestamp: mockTimestamp,
        uptime: 12345,
        environment: 'test',
        dependencies: { dbConnected: true },
      });

      expect(result.success).toBe(true);
    });

    // Verifies the schema for the degraded data object itself
    it('should validate degraded data', () => {
      const result = HealthDegradedDataSchema.safeParse({
        status: 'unhealthy',
        timestamp: mockTimestamp,
        uptime: 12345,
        environment: 'test',
        dependencies: { dbConnected: false },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('HealthSuccessResponseSchema', () => {
    // Verifies that a valid healthy response object is accepted by the schema
    it('should validate a healthy response', () => {
      const result = HealthSuccessResponseSchema.safeParse({
        success: true,
        message: 'All good',
        responseObject: {
          status: 'healthy',
          timestamp: mockTimestamp,
          uptime: 12345,
          environment: 'test',
          dependencies: { dbConnected: true },
        },
        statusCode: HTTP_STATUS.OK,
      });

      expect(result.success).toBe(true);
    });

    // Ensures the schema rejects a healthy response with an invalid status
    it('should reject healthy response with invalid status', () => {
      const result = HealthSuccessResponseSchema.safeParse({
        success: true,
        message: 'All good',
        responseObject: {
          status: 'invalid-status',
          timestamp: mockTimestamp,
          uptime: 12345,
          environment: 'test',
          dependencies: { dbConnected: true },
        },
        statusCode: HTTP_STATUS.OK,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('HealthDegradedResponseSchema', () => {
    // Verifies that a valid degraded response object is accepted
    it('should validate a degraded response', () => {
      const result = HealthDegradedResponseSchema.safeParse({
        success: false,
        message: 'Database down',
        responseObject: {
          status: 'unhealthy',
          timestamp: mockTimestamp,
          uptime: 12345,
          environment: 'test',
          dependencies: { dbConnected: false },
        },
        statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
      });

      expect(result.success).toBe(true);
    });

    // Ensures the schema rejects a degraded response if dependencies are healthy
    it('should reject degraded response with healthy dependencies', () => {
      const result = HealthDegradedResponseSchema.safeParse({
        success: false,
        message: 'Database down',
        responseObject: {
          status: 'unhealthy',
          timestamp: mockTimestamp,
          uptime: 12345,
          environment: 'test',
          dependencies: { dbConnected: true },
        },
        statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('HealthErrorResponseSchema', () => {
    // Verifies that an error response with a null responseObject is valid
    it('should validate error response with null responseObject', () => {
      const result = ErrorResponseSchema.safeParse({
        success: false,
        message: 'Internal server error',
        responseObject: null,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });

      expect(result.success).toBe(true);
    });

    // Verifies that a detailed error response (for development) is valid
    it('should validate error response with development details', () => {
      const result = ErrorResponseSchema.safeParse({
        success: false,
        message: 'Validation failed',
        responseObject: {
          stack: 'Error: Something went wrong',
          details: [{ path: 'email', message: 'Invalid email format' }],
        },
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });

      expect(result.success).toBe(true);
    });
  });
});
