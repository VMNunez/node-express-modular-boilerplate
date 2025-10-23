import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';
import { HealthRepository } from '@/modules/health/repositories/health.repository.js';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient prototype (afecta a todas las instancias)
vi.mock('@prisma/client', () => {
  const $queryRaw = vi.fn();
  return {
    PrismaClient: vi.fn(() => ({ $queryRaw })),
  };
});

describe('checkDatabaseConnection', () => {
  it('should return true when the database connection is successful', async () => {
    const prisma = new PrismaClient();

    (prisma.$queryRaw as Mock).mockResolvedValue([{ '1': 1 }]);

    const isConnected = await HealthRepository.checkDatabaseConnection();

    expect(isConnected).toBe(true);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should return false when the database connection fails', async () => {
    const prisma = new PrismaClient();
    (prisma.$queryRaw as Mock).mockRejectedValue(new Error('Connection failed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const isConnected = await HealthRepository.checkDatabaseConnection();

    expect(isConnected).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});
