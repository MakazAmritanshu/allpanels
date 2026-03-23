import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      include: [
        // Change this line to match your file structure
        './controllers/betController.js', // Add ./ at the start
      ],
      exclude: [
        'node_modules/**',
        'coverage/**',
        'controllers/admin/**',
        'socket/**',
        'routes/admin/**',
      ],
      all: true, // Add this to ensure all code is analyzed
    },
  },
});
