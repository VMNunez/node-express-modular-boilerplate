import { envSchema, validateEnv } from '@core/config/env.schema.js';
import { describe, it, expect } from 'vitest';

// Defines the test suite for the environment schema validation
describe('env schema validation', () => {
  // Validates that correct variables are parsed successfully
  it('should validate correct environment variables', () => {
    const validEnv = {
      NODE_ENV: 'development',
      HOST: 'localhost',
      PORT: '4000',
      CORS_ORIGIN: 'http://localhost:4000',
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      JWT_ACCESS_SECRET: 'a'.repeat(32),
    };

    const result = envSchema.parse(validEnv);

    // Verifies that the parsed values and types are correct
    expect(result.NODE_ENV).toBe('development');
    expect(result.HOST).toBe('localhost');
    expect(result.PORT).toBe(4000); // Check type coercion
    expect(result.CORS_ORIGIN).toEqual(['http://localhost:4000']);
    expect(result.DATABASE_URL).toBe('postgres://user:pass@localhost:5432/db');
    expect(result.JWT_ACCESS_SECRET).toHaveLength(32);
  });

  // Verifies that default values are used when variables are missing
  it('should use default values', () => {
    const envWithDefaults = {
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      JWT_ACCESS_SECRET: 'a'.repeat(32),
      // Other variables are intentionally missing to test defaults
    };

    const result = envSchema.parse(envWithDefaults);

    // Asserts that the default values are correctly applied
    expect(result.NODE_ENV).toBe('production');
    expect(result.HOST).toBe('localhost');
    expect(result.PORT).toBe(8080);
    expect(result.CORS_ORIGIN).toEqual(['http://localhost:8080']);
  });

  // Ensures an error is thrown if a required variable is missing
  it('should throw if DATABASE_URL is missing', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'test',
        HOST: 'localhost',
        PORT: '4000',
        CORS_ORIGIN: 'http://localhost:4000',
        JWT_ACCESS_SECRET: 'a'.repeat(32),
        // DATABASE_URL is missing here, which should cause a failure
      }),
    ).toThrow('Invalid environment variables');
  });

  it('should parse comma-separated CORS_ORIGIN into array', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      JWT_ACCESS_SECRET: 'a'.repeat(32),
      CORS_ORIGIN: 'http://localhost:3000,http://localhost:8080',
    });
    expect(result.CORS_ORIGIN).toEqual(['http://localhost:3000', 'http://localhost:8080']);
  });
});
