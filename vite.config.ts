import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    // Prefer .ts sources — stale src/**/*.js duplicates must not shadow screens/icons.
    extensions: ['.ts', '.tsx', '.mts', '.mjs', '.js', '.jsx', '.json'],
  },
  build: {
    target: 'es2020',
  },
  test: {
    environment: 'node',
  },
});
