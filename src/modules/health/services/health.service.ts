import { env } from '@core/config/env.schema.js';
import type { HealthData } from '@modules/health/types/health.type.js';
import { HealthRepository } from '@modules/health/repositories/health.repository.js';

export class HealthService {
  static async getHealthStatus(): Promise<HealthData> {
    // Verify database connection
    const dbConnected: boolean = await HealthRepository.checkDatabaseConnection();

    // Define the base properties common to all responses
    const baseData = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV || 'development',
    };

    // Return a 'healthy' status if the database is connected
    if (dbConnected) {
      return {
        ...baseData,
        status: 'healthy',
        dependencies: { dbConnected },
      };
    }
    // Return an 'unhealthy' status if the database is not connected
    return {
      ...baseData,
      status: 'unhealthy',
      dependencies: { dbConnected },
    };
  }
}
