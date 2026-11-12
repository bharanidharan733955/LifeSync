import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'src/config/swagger.js'],
    },
    testTimeout: 60000,
    hookTimeout: 300000,
    include: ['tests/**/*.test.js'],
  },
});
