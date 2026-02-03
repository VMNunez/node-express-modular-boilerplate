import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from '@core/middlewares/error-handler.middleware.js';
import { AuthService } from '@modules/auth/services/auth.service.js';

const mockRepo = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  createUser: vi.fn(),
  findById: vi.fn(),
}));

vi.mock('@modules/auth/repositories/auth.repository.js', () => ({
  AuthRepository: vi.fn(() => mockRepo),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService();
  });

  describe('register', () => {
    it('should register a new user and return public user (no passwordHash in response)', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      const createdUser = {
        id: 'user-uuid',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: '$2a$10$hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepo.createUser.mockResolvedValue(createdUser);

      const result = await service.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockRepo.createUser).toHaveBeenCalledTimes(1);
      const createUserArg = mockRepo.createUser.mock.calls[0][0];
      expect(createUserArg.name).toBe('Test User');
      expect(createUserArg.email).toBe('test@example.com');
      expect(typeof createUserArg.passwordHash).toBe('string');
      expect(createUserArg.passwordHash.length).toBeGreaterThan(0);
      expect(result.user).toEqual({
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should throw ApiError.conflict when email already exists', async () => {
      mockRepo.findByEmail.mockResolvedValue({
        id: 'existing',
        email: 'existing@example.com',
        name: 'Existing',
      });

      await expect(
        service.register({
          name: 'New User',
          email: 'existing@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ApiError);

      await expect(
        service.register({
          name: 'New User',
          email: 'existing@example.com',
          password: 'password123',
        }),
      ).rejects.toMatchObject({ statusCode: 409, message: 'Email is already registered' });

      expect(mockRepo.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return user and tokens when credentials are valid', async () => {
      const user = {
        id: 'user-uuid',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: await import('bcryptjs').then((b) => b.default.hash('password123', 10)),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepo.findByEmail.mockResolvedValue(user);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result.user).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      expect(typeof result.accessToken).toBe('string');
      expect(result.accessToken.length).toBeGreaterThan(0);
      expect(typeof result.refreshToken).toBe('string');
      expect(result.refreshToken.length).toBeGreaterThan(0);
      expect(typeof result.expiresIn).toBe('string');
    });

    it('should throw ApiError.unauthorized when user not found', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@example.com', password: 'any' }),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    });

    it('should throw ApiError.unauthorized when password is invalid', async () => {
      const user = {
        id: 'user-uuid',
        name: 'Test',
        email: 'test@example.com',
        passwordHash: await import('bcryptjs').then((b) => b.default.hash('correct', 10)),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepo.findByEmail.mockResolvedValue(user);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    });
  });

  describe('refresh', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const user = {
        id: 'user-uuid',
        name: 'Test',
        email: 'test@example.com',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepo.findById.mockResolvedValue(user);

      const { jwtUtil } = await import('@core/auth/jwt.util.js');
      const validRefreshToken = jwtUtil.signRefreshToken({ sub: user.id });

      const result = await service.refresh({ refreshToken: validRefreshToken });

      expect(mockRepo.findById).toHaveBeenCalledWith('user-uuid');
      expect(typeof result.accessToken).toBe('string');
      expect(result.accessToken.length).toBeGreaterThan(0);
      expect(typeof result.refreshToken).toBe('string');
      expect(typeof result.expiresIn).toBe('string');
    });

    it('should throw ApiError.unauthorized when user no longer exists', async () => {
      const { jwtUtil } = await import('@core/auth/jwt.util.js');
      const validRefreshToken = jwtUtil.signRefreshToken({ sub: 'deleted-user-id' });
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.refresh({ refreshToken: validRefreshToken })).rejects.toMatchObject({
        statusCode: 401,
        message: 'User no longer exists',
      });
    });
  });
});
