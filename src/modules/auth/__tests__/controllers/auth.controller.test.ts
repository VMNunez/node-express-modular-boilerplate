import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';

const mockAuthServiceInstance = vi.hoisted(() => ({
  register: vi.fn(),
  login: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('@modules/auth/services/auth.service.js', () => ({
  AuthService: vi.fn(() => mockAuthServiceInstance),
}));

let register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
let login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
let refresh: (req: Request, res: Response, next: NextFunction) => Promise<void>;

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
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe('register', () => {
    it('should return 201 and user when registration succeeds', async () => {
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

      await register(mockReq as Request, mockRes as Response, mockNext);

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

    it('should call next with error when validation fails', async () => {
      mockReq.body = { name: 'A', email: 'invalid', password: 'short' };

      await register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockAuthServiceInstance.register).not.toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: '15m',
      };
      mockAuthServiceInstance.login.mockResolvedValue(loginResult);
      mockReq.body = { email: 'test@example.com', password: 'password123' };

      await login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockAuthServiceInstance.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          statusCode: HTTP_STATUS.OK,
          responseObject: loginResult,
        }),
      );
    });

    it('should call next with error when body is invalid', async () => {
      mockReq.body = {};

      await login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockAuthServiceInstance.login).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should return 200 with new tokens when refresh succeeds', async () => {
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
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Token refreshed',
        responseObject: refreshResult,
        statusCode: HTTP_STATUS.OK,
      });
    });

    it('should call next with error when refreshToken is missing', async () => {
      mockReq.body = {};

      await refresh(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockAuthServiceInstance.refresh).not.toHaveBeenCalled();
    });
  });
});
