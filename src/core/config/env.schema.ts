import dotenv from 'dotenv';
import { z } from 'zod';

// Loads environment variables from the .env file
dotenv.config();

// Defines the validation schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  HOST: z.string().min(1).default('localhost'),
  PORT: z.coerce.number().int().positive().default(8080),
  CORS_ORIGIN: z.url().default('http://localhost:8080'),
  DATABASE_URL: z.string().min(1),
});

// Function to validate the environment
function validateEnv(env: NodeJS.ProcessEnv) {
  // Parses and validates the environment variables
  const parsed = envSchema.safeParse(env);

  // If validation fails, throws an error
  if (!parsed.success) {
    throw new Error('Invalid environment variables');
  }

  // Returns the validated object with helper properties
  return {
    ...parsed.data,
    isDevelopment: parsed.data.NODE_ENV === 'development',
    isProduction: parsed.data.NODE_ENV === 'production',
    isTest: parsed.data.NODE_ENV === 'test',
  };
}

// Validates the application's global environment
const env = validateEnv(process.env);

// Exports the schema for testing and the validated env object
export { envSchema, env, validateEnv };
