/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: path.join(__dirname, '..'),
  cacheDir: '../../node_modules/.vite/libs/hermes-node',
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    environment: 'node',
    // Only run node-specific tests (e.g., child process communication)
    include: ['src/**/*.node.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['./config/setup-node-test.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/hermes/node',
      provider: 'v8' as const,
      include: ['src/node/**/*.ts', 'src/child-process/**/*.ts'],
      exclude: [
        '**/*/index.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
      ],
    },
  },
}));
