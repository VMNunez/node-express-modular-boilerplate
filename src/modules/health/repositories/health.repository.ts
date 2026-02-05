import { logger } from '@/core/utils/logger.util.js';
import { prisma } from '@core/database/prisma.client.js';

export class HealthRepository {
  static async checkDatabaseConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error({ error }, 'Database connection check failed');
      return false;
    }
  }

  static async getDatabaseMetrics(): Promise<{
    connected: boolean;
    latency?: number;
  }> {
    const startTime = Date.now();
    try {
      /**
       * Execute a primitive query to verify the connection.
       * 'SELECT 1' is used because it requires minimal resources
       * and confirms the database engine is active.
       */
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - startTime;
      return {
        connected: true,
        latency, // Time taken for the round-trip in ms
      };
    } catch (error) {
      // Log the specific database error for infrastructure monitoring
      logger.error({ error }, 'Database metrics check failed');
      return {
        connected: false,
      };
    }
  }
}
