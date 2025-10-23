import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import type { HealthData } from '@/modules/health/types/health.type.js';
import { getHealth } from '@modules/health/controllers/health.controller.js';
import { HealthService } from '@modules/health/services/health.service.js';
import { HTTP_STATUS } from '@core/utils/http/http-status.util.js';

vi.mock('@services/index.js', () => {
  const mockService = {
    getHealthStatus: vi.fn(),
  };
  return { HealthCheckService: mockService };
});

// Define the test suite for the controller
describe('healthController', () => {
  // Declare mock variables for the Express request and response objects
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {}; // Reset the request object for each test.
    mockRes = {
      status: vi.fn().mockReturnThis(), // Mock the `status` method and allow method chaining (`.json()`)
      json: vi.fn(), // Mock the `json` method
    };
    mockNext = vi.fn();
  });

  // Test case for a successful scenario
  it('should return healthy response when service is healthy', async () => {
    // Define the mock response object we expect when the database is connected
    const mockServiceResponse: HealthData = {
      status: 'healthy',
      timestamp: '2025-09-23T07:16:12.790Z',
      uptime: 16.437734072,
      environment: 'production',
      dependencies: { dbConnected: true },
    };

    // Spy on the `getHealthStatus` service method and force it to return a "healthy" object
    vi.spyOn(HealthService, 'getHealthStatus').mockResolvedValue(mockServiceResponse);

    // Execute the controller with the mock request and response objects
    await getHealth(mockReq as Request, mockRes as Response, mockNext);

    // Assert that the `status` method was called with the correct HTTP status code
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);

    // Assert that the `json` method was called with an object containing `success: true` and a specific message
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: 'Service is healthy',
      responseObject: mockServiceResponse,
      statusCode: HTTP_STATUS.OK,
    });
  });

  // Test case for unhealthy scenario
  it('should return unhealthy response when service is unhealthy', async () => {
    // Define the mock response object we expect when the database is disconnected
    const mockServiceResponse: HealthData = {
      status: 'unhealthy',
      timestamp: '2025-09-23T07:16:12.790Z',
      uptime: 16.437734072,
      environment: 'production',
      dependencies: { dbConnected: false },
    };

    // Spy on the service method and make it return the "unhealthy" mock data
    vi.spyOn(HealthService, 'getHealthStatus').mockResolvedValue(mockServiceResponse);

    // Run the controller
    await getHealth(mockReq as Request, mockRes as Response, mockNext);

    // Assert the response status code is 503 SERVICE_UNAVAILABLE
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.SERVICE_UNAVAILABLE);

    // Assert the response JSON body, including `success: false` and the specific message
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Service unavailable - Database connection failed',
      responseObject: mockServiceResponse,
      statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
    });
  });

  it('should call next with the error if an unexpected error occurs', async () => {
    const mockError = new Error('Unexpected error');
    vi.spyOn(HealthService, 'getHealthStatus').mockRejectedValue(mockError);

    await getHealth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(mockError);

    // Should not send direct response
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });
});
