/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: path.join(__dirname, '..'),
  cacheDir: '../../../node_modules/.vite/libs/hermes-iframe',
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: process.env.HEADLESS !== 'false',
    },
    include: ['src/iframe/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      clean: true,
      reportsDirectory: path.join(__dirname, '../../../coverage/libs/hermes/iframe'),
      provider: 'istanbul',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/iframe/**/*.ts'],
      exclude: [
        '**/index.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
      ],
    },
  },
}));
