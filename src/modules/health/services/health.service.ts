import { env } from '@core/config/env.schema.js';
import type { HealthData } from '@modules/health/types/health.type.js';
import { HealthRepository } from '@modules/health/repositories/health.repository.js';

export class HealthService {
  /**
   * Aggregates various system metrics to determine the overall health status.
   * This is used for external monitoring (Kubernetes, AWS Route53, UptimeRobot).
   * * @returns {Promise<HealthData>} A detailed health report including status and system metrics.
   */
  static async getHealthStatus(): Promise<HealthData> {
    // Collect infrastructure and system-level metrics
    const dbMetrics = await HealthRepository.getDatabaseMetrics();

    // Standard properties present in every health check response
    const baseData = {
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()), // Uptime in seconds
      environment: env.NODE_ENV || 'development',
    };

    const isHealthy = dbMetrics.connected;

    // Successful Health Report
    if (isHealthy) {
      return {
        ...baseData,
        status: 'healthy',
        dependencies: {
          dbConnected: dbMetrics.connected,
          dbLatency: dbMetrics.latency,
        },
      };
    }

    /**
     * Degraded/Unhealthy Report:
     * Provides specific warning messages to help infrastructure teams
     * identify the root cause (e.g., OOM or DB downtime).
     */
    return {
      ...baseData,
      status: 'unhealthy',
      dependencies: {
        dbConnected: dbMetrics.connected,
        dbLatency: dbMetrics.latency,
      },
    };
  }
}
