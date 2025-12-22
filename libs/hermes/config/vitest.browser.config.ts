/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: path.join(__dirname, '..'),
  cacheDir: '../../node_modules/.vite/libs/hermes-browser',
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    // Browser mode configuration
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: process.env.HEADLESS !== 'false',
      // Ensure Web Worker support
      providerOptions: {
        launch: {
          args: ['--enable-features=SharedArrayBuffer'],
        },
      },
    },
    // Only run browser-specific tests
    include: ['src/worker/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['./config/setup-browser-test.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/hermes/browser',
      provider: 'v8' as const,
      include: ['src/worker/**/*.ts'],
      exclude: [
        '**/*/index.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
      ],
    },
  },
}));
