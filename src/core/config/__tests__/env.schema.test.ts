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
    };

    const result = envSchema.parse(validEnv);

    // Verifies that the parsed values and types are correct
    expect(result.NODE_ENV).toBe('development');
    expect(result.HOST).toBe('localhost');
    expect(result.PORT).toBe(4000); // Check type coercion
    expect(result.CORS_ORIGIN).toBe('http://localhost:4000');
    expect(result.DATABASE_URL).toBe('postgres://user:pass@localhost:5432/db');
  });

  // Verifies that default values are used when variables are missing
  it('should use default values', () => {
    const envWithDefaults = {
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      // Other variables are intentionally missing to test defaults
    };

    const result = envSchema.parse(envWithDefaults);

    // Asserts that the default values are correctly applied
    expect(result.NODE_ENV).toBe('production');
    expect(result.HOST).toBe('localhost');
    expect(result.PORT).toBe(8080);
    expect(result.CORS_ORIGIN).toBe('http://localhost:8080');
  });

  // Ensures an error is thrown if a required variable is missing
  it('should throw if DATABASE_URL is missing', () => {
    // The validation function is wrapped to catch the thrown error
    expect(() =>
      validateEnv({
        NODE_ENV: 'test',
        HOST: 'localhost',
        PORT: '4000',
        CORS_ORIGIN: 'http://localhost:4000',
        // DATABASE_URL is missing here, which should cause a failure
      }),
    ).toThrow('Invalid environment variables');
  });
});
