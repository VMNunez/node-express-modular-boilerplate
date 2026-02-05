import { env } from '@core/config/env.schema.js';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton Configuration.
 *  Connection pooling is managed via the DATABASE_URL environment variable.
 * Recommended production parameters for the query string:
 * - connection_limit: Max simultaneous connections (Default: 10)
 * - pool_timeout: Max wait time for a free connection (Default: 10s)
 *  Example: postgresql://user:pass@host:5432/db?connection_limit=20
 */
export const prisma = new PrismaClient({
  /**
   * Logging Strategy:
   * - Development: Detailed logs including every SQL query for debugging.
   * - Production: Minimal logging (errors only) to optimize performance and security.
   */
  log: env.isDevelopment ? ['query', 'error', 'warn'] : ['error'],

  /**
   * Error Formatting:
   * Using 'minimal' avoids long stack traces in logs that can lead to
   * "log bloating" and potential exposure of internal DB structure.
   */
  errorFormat: 'minimal',
});

/**
 * NOTE: Resource Cleanup
 * Graceful shutdown is orchestrated in 'main.ts'.
 * It ensures the HTTP server stops accepting traffic before
 * calling prisma.$disconnect(), preventing "Connection Closed" errors mid-request.
 */

/**
 * Centralized export of Database Resilience Utilities.
 * This pattern allows other services to import 'prisma' and its
 * retry logic from the same module.
 */
export { withRetry, dbCircuitBreaker } from './prisma-retry.util.js';
export type { RetryConfig, CircuitBreakerConfig } from './prisma-retry.util.js';
