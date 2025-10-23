import { prisma } from '@core/database/prisma.client.js';

export class HealthRepository {
  static async checkDatabaseConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }
}
