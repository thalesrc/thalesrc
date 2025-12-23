/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: path.join(__dirname, '..'),
  cacheDir: '../../../node_modules/.vite/libs/hermes-core',
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'src/worker/**',
      'src/chrome/**',
      'src/broadcast/**',
      'src/iframe/**',
    ],
    reporters: ['default'],
    coverage: {
      clean: true,
      reportsDirectory: path.join(__dirname, '../../../coverage/libs/hermes/core'),
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        '**/index.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
        'src/worker/**',
        'src/chrome/**',
        'src/broadcast/**',
        'src/iframe/**',
      ],
    },
  },
}));
