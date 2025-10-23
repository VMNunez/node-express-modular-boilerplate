import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { HealthService } from '@modules/health/services/health.service.js';
import { HealthRepository } from '@modules/health/repositories/health.repository.js';
import { env } from '@core/config/env.schema.js';

vi.mock('@modules/health/repositories/health.repository.js', () => ({
  HealthRepository: {
    checkDatabaseConnection: vi.fn(),
  },
}));

// Define the test suite for the service
describe('HealthCheckService', () => {
  // Use beforeEach to ensure that all mocks are reset before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test case for a successful scenario
  it('should return healthy status when database is connected', async () => {
    // Mock checkDatabaseConnection to simulate a successful database connection

    (HealthRepository.checkDatabaseConnection as Mock).mockResolvedValue(true);
    // Explicitly mock the environment to 'production' to ensure test consistency
    vi.spyOn(env, 'NODE_ENV', 'get').mockReturnValue('production');

    // Call the service method we are testing
    const result = await HealthService.getHealthStatus();

    // Assert that the status is 'healthy'
    expect(result.status).toBe('healthy');
    // Assert that the database dependency is connected
    expect(result.dependencies.dbConnected).toBe(true);
    // Assert that the environment is as expected
    expect(result.environment).toBe('production');
    // Assert that the timestamp's type is a string
    expect(typeof result.timestamp).toBe('string');
    // Assert that the uptime's type is a number
    expect(typeof result.uptime).toBe('number');
  });

  // // Test case for an unhealthy scenario
  it('should return unhealthy status when database is not connected', async () => {
    // Mock checkDatabaseConnection to simulate a database connection error
    (HealthRepository.checkDatabaseConnection as Mock).mockResolvedValue(false);

    // Call the service method we are testing
    const result = await HealthService.getHealthStatus();
    // Explicitly mock the environment to 'production' to ensure test consistency
    vi.spyOn(env, 'NODE_ENV', 'get').mockReturnValue('production');

    // Assert that the status is 'unhealthy'
    expect(result.status).toBe('unhealthy');
    // Assert that the database dependency is not connected
    expect(result.dependencies.dbConnected).toBe(false);
    // Explicitly mock the environment to 'production' to ensure test consistency
    vi.spyOn(env, 'NODE_ENV', 'get').mockReturnValue('production');
    // Assert that the timestamp's type is a string
    expect(typeof result.timestamp).toBe('string');
    // Assert that the uptime's type is a number
    expect(typeof result.uptime).toBe('number');
  });

  it('should fallback to "development" if NODE_ENV is not set', async () => {
    // Mock DB connection to succeed

    (HealthRepository.checkDatabaseConnection as Mock).mockResolvedValue(true);

    // // Simulate NODE_ENV being undefined
    Object.defineProperty(env, 'NODE_ENV', {
      get: () => undefined,
    });

    // Call the service
    const result = await HealthService.getHealthStatus();

    // Expect fallback value to be "development"
    expect(result.environment).toBe('development');
  });
});
