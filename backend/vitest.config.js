import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', 'src/config/swagger.js'],
    },
    testTimeout: 60000,
    // Separate setup for DB tests vs pure unit tests
    include: ['tests/**/*.test.js'],
  },
});
