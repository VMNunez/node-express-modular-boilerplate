import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository.js';
import { prisma } from '@core/database/prisma.client.js';

vi.mock('@core/database/prisma.client.js', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('AuthRepository', () => {
  const repository = new AuthRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user and return it', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed',
      } as const; // Añadir 'as const' o tipar explícitamente

      const createdUser = {
        id: 'uuid-123',
        name: userData.name,
        email: userData.email,
        passwordHash: userData.passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as Mock).mockResolvedValue(createdUser);

      // Hacer el cast al tipo esperado por el repositorio
      const result = await repository.createUser(
        userData as Parameters<typeof repository.createUser>[0],
      );

      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: userData.name,
          email: userData.email,
          passwordHash: userData.passwordHash,
        },
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const user = {
        id: 'uuid-123',
        name: 'Test',
        email: 'test@example.com',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as Mock).mockResolvedValue(user);

      const result = await repository.findByEmail('test@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(null);

      const result = await repository.findByEmail('missing@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = {
        id: 'uuid-123',
        name: 'Test',
        email: 'test@example.com',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as Mock).mockResolvedValue(user);

      const result = await repository.findById('uuid-123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-123' } });
      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      (prisma.user.findUnique as Mock).mockResolvedValue(null);

      const result = await repository.findById('missing-id');

      expect(result).toBeNull();
    });
  });
});
