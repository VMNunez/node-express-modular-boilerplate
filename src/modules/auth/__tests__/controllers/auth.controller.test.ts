import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';

/**
 * Mocking the AuthService.
 * We use vi.hoisted to ensure the mock is created before the controller is imported.
 * This pattern allows us to control the behavior of the service in each test.
 */
const mockAuthServiceInstance = vi.hoisted(() => ({
  register: vi.fn(),
  login: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('@modules/auth/services/auth.service.js', () => ({
  AuthService: vi.fn(() => mockAuthServiceInstance),
}));

// Typed controller methods for testing
let register: (req: Request, res: Response, next: NextFunction) => void;
let login: (req: Request, res: Response, next: NextFunction) => void;
let refresh: (req: Request, res: Response, next: NextFunction) => void;

/**
 * Dynamic import to ensure the controller uses the mocked service
 * defined above.
 */
beforeAll(async () => {
  const controller = await import('@modules/auth/controllers/auth.controller.js');
  register = controller.register;
  login = controller.login;
  refresh = controller.refresh;
});

describe('authController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = { body: {} };
    // Fluent interface mock (status().json())
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe('register', () => {
    it('should return 201 and user when registration succeeds', async () => {
      // Setup: Mock successful service response
      const user = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockAuthServiceInstance.register.mockResolvedValue({ user });

      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Execution
      await register(mockReq as Request, mockRes as Response, mockNext);

      // Assertions
      expect(mockAuthServiceInstance.register).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User registered successfully',
          statusCode: HTTP_STATUS.CREATED,
          responseObject: { user },
        }),
      );
    });

    it('should call next with error when Zod validation fails', async () => {
      // Invalid input to trigger Zod error in the controller
      mockReq.body = { name: 'A', email: 'invalid', password: 'short' };

      await register(mockReq as Request, mockRes as Response, mockNext);

      // Verify that the error was caught and passed to the error handler
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockAuthServiceInstance.register).not.toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should forward service errors to the next middleware', async () => {
      const serviceError = new Error('Email is already registered');
      mockAuthServiceInstance.register.mockRejectedValue(serviceError);

      mockReq.body = {
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
      };

      await register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('login', () => {
    it('should return 200 with user and tokens when login succeeds', async () => {
      const loginResult = {
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Test User',
          email: 'test@example.com',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: '15m',
      };
      mockAuthServiceInstance.login.mockResolvedValue(loginResult);
      mockReq.body = { email: 'test@example.com', password: 'password123' };

      await login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          responseObject: loginResult,
        }),
      );
    });
  });

  describe('refresh', () => {
    it('should successfully rotate tokens', async () => {
      const refreshResult = {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        expiresIn: '15m',
      };
      mockAuthServiceInstance.refresh.mockResolvedValue(refreshResult);
      mockReq.body = { refreshToken: 'old-refresh-token' };

      await refresh(mockReq as Request, mockRes as Response, mockNext);

      expect(mockAuthServiceInstance.refresh).toHaveBeenCalledWith({
        refreshToken: 'old-refresh-token',
      });
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });
  });
});
