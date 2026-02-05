import dotenv from 'dotenv';
import { z } from 'zod';

// Loads environment variables from the .env file
dotenv.config();

// CORS: accepts single URL or comma-separated list (e.g. "http://localhost:3000,http://localhost:8080")
const corsOriginSchema = z
  .string()
  .min(1)
  .default('http://localhost:8080')
  .transform((val) => val.split(',').map((origin) => origin.trim()))
  .pipe(z.array(z.string().url()));

// Defines the validation schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  HOST: z.string().min(1).default('localhost'),
  PORT: z.coerce.number().int().positive().default(8080),
  CORS_ORIGIN: corsOriginSchema,
  DATABASE_URL: z.string().min(1),
  // JWT: use strong secrets (32+ chars) in production
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
    .optional(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

// Function to validate the environment
function validateEnv(env: NodeJS.ProcessEnv) {
  // Parses and validates the environment variables
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    // Format Zod errors into a readable string for the terminal/logs
    const errors = parsed.error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
        return `${path}: ${issue.message}`;
      })
      .join('; ');

    throw new Error(`Invalid environment variables: ${errors}`);
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
