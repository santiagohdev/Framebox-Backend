import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Las pruebas tocan una base en memoria compartida: en paralelo se pisan.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
