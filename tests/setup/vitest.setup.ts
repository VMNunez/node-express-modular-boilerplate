import { config } from 'dotenv';
import { beforeEach, vi } from 'vitest';

// Carga las variables de entorno de test
config({ path: '.env.test' });

// vitest.setup.ts
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
