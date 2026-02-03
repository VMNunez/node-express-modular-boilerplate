import { describe, it, expect } from 'vitest';
import {
  UserRegisterInputSchema,
  UserLoginInputSchema,
  RefreshTokenInputSchema,
} from '@/modules/auth/schemas/auth-input.schema.js';
import {
  PublicUserSchema,
  RegisterSuccessResponseSchema,
  AuthSuccessResponseSchema,
  RefreshSuccessResponseSchema,
} from '@/modules/auth/schemas/auth-response.schema.js';
import { ErrorResponseSchema } from '@/common/schemas/api-response.schema.js';
import { HTTP_STATUS } from '@utils/http/http-status.util.js';

describe('Auth Input Schemas', () => {
  describe('UserRegisterInputSchema', () => {
    it('should validate valid register input', () => {
      const result = UserRegisterInputSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short name', () => {
      const result = UserRegisterInputSchema.safeParse({
        name: 'A',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = UserRegisterInputSchema.safeParse({
        name: 'Test User',
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = UserRegisterInputSchema.safeParse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('UserLoginInputSchema', () => {
    it('should validate valid login input', () => {
      const result = UserLoginInputSchema.safeParse({
        email: 'test@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const result = UserLoginInputSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('RefreshTokenInputSchema', () => {
    it('should validate valid refresh input', () => {
      const result = RefreshTokenInputSchema.safeParse({
        refreshToken: 'some-jwt-token',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty refreshToken', () => {
      const result = RefreshTokenInputSchema.safeParse({
        refreshToken: '',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Auth Response Schemas', () => {
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  describe('PublicUserSchema', () => {
    it('should validate public user without passwordHash', () => {
      const result = PublicUserSchema.safeParse(mockUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid uuid', () => {
      const result = PublicUserSchema.safeParse({
        ...mockUser,
        id: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('RegisterSuccessResponseSchema', () => {
    it('should validate register success response', () => {
      const result = RegisterSuccessResponseSchema.safeParse({
        success: true,
        message: 'User registered successfully',
        responseObject: { user: mockUser },
        statusCode: HTTP_STATUS.CREATED,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('AuthSuccessResponseSchema', () => {
    it('should validate login success response', () => {
      const result = AuthSuccessResponseSchema.safeParse({
        success: true,
        message: 'Login successful',
        responseObject: {
          user: mockUser,
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresIn: '15m',
        },
        statusCode: HTTP_STATUS.OK,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('RefreshSuccessResponseSchema', () => {
    it('should validate refresh success response', () => {
      const result = RefreshSuccessResponseSchema.safeParse({
        success: true,
        message: 'Token refreshed',
        responseObject: {
          accessToken: 'token',
          refreshToken: 'refresh',
          expiresIn: '15m',
        },
        statusCode: HTTP_STATUS.OK,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('ErrorResponseSchema (auth context)', () => {
    it('should validate 401 error response', () => {
      const result = ErrorResponseSchema.safeParse({
        success: false,
        message: 'Invalid email or password',
        responseObject: null,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
      });
      expect(result.success).toBe(true);
    });
  });
});
