import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    clearMocks: true,
    restoreMocks: true,
    isolate: true,
    setupFiles: path.resolve(__dirname, 'tests/setup/vitest.setup.ts'),
    include: ['src/**/__tests__/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'coverage'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: [
        '**/__tests__/**',
        'dist/**',
        'node_modules/**',
        'tests/**',
        'src/app.ts',
        'src/server.ts',
        'src/core/docs/**',
        'src/core/database/**',
        'src/modules/**/**/*.route.ts',
        'src/modules/**/**/*.openapi.ts',
        '**/*.type.ts',
        '**/index.ts',
      ],
    },
  },
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] })],
});
