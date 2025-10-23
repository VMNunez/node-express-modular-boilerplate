import { env } from '@core/config/env.schema.js';
import { PrismaClient } from '@prisma/client';

// Global Prisma instance for connection reuse
export const prisma = new PrismaClient({
  // Configure logging based on environment
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'minimal', // Use minimal error formatting
});

// Graceful shutdown - close DB connections when process ends
process.on('beforeExit', async () => {
  console.log('beforeExit: Closing database connections...');
  await prisma.$disconnect();
  console.log('Database connections closed');
});

// Handle Ctrl+C termination gracefully
process.on('SIGINT', async () => {
  console.log('SIGINT received: Graceful shutdown...');
  await prisma.$disconnect();
  console.log('Database connections closed');
  process.exit(0); // Exit with success code
});
