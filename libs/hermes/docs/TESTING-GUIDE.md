# Hermes Testing Guide

This document explains the testing structure for the Hermes library, which is organized by submodules for modular testing and coverage tracking.

## Overview

The Hermes library uses a modular testing setup where each submodule has its own testing configuration, but all tests can be run from a single unified task.

## Architecture

### Submodules

The library is organized into the following testable submodules:

1. **Core** (`src/`) - Core messaging functionality (Node.js environment)
2. **Worker** (`src/worker/`) - Web Worker communication (Browser environment)
3. **Chrome** (`src/chrome/`) - Chrome extension messaging (Browser environment with extension APIs)
4. **Broadcast** (`src/broadcast/`) - Broadcast Channel API messaging (Browser environment)
5. **Iframe** (`src/iframe/`) - iframe communication (Browser environment)

### Configuration Files

Each submodule has its own `vitest.config.ts` file in its directory:

```
libs/hermes/
├── src/
│   ├── vitest.config.ts              # Core tests (Node.js)
│   ├── worker/
│   │   └── vitest.config.ts          # Worker tests (Browser)
│   ├── chrome/
│   │   └── vitest.config.ts          # Chrome extension tests (Browser)
│   ├── broadcast/
│   │   └── vitest.config.ts          # Broadcast tests (Browser)
│   └── iframe/
│       └── vitest.config.ts          # Iframe tests (Browser)
```

## Running Tests

### Run All Tests

To run all tests across all submodules:

```bash
pnpm nx run hermes:test
```

This command runs tests in parallel across all submodules.

### Run Individual Submodule Tests

You can run tests for specific submodules:

```bash
# Core tests (Node.js environment)
pnpm nx run hermes:test/core

# Worker tests (Browser)
pnpm nx run hermes:test/worker

# Chrome extension tests
pnpm nx run hermes:test/chrome

# Broadcast tests
pnpm nx run hermes:test/broadcast

# Iframe tests
pnpm nx run hermes:test/iframe
```

### Run Browser Tests in Headed Mode

For debugging browser tests, you can run them in headed mode (visible browser):

```bash
pnpm nx run hermes:test/headed
```

Or set the environment variable for specific tests:

```bash
HEADLESS=false pnpm nx run hermes:test/worker
```

## Coverage

### Generate Coverage

All test tasks automatically generate coverage reports when run with the `:with-coverage` configuration:

```bash
# Run tests with coverage
pnpm nx run hermes:test/core:with-coverage
pnpm nx run hermes:test/worker:with-coverage
```

Each submodule generates its own coverage report:

- Core: `coverage/libs/hermes/core/`
- Worker: `coverage/libs/hermes/worker/`
- Chrome: `coverage/libs/hermes/chrome/`
- Broadcast: `coverage/libs/hermes/broadcast/`
- Iframe: `coverage/libs/hermes/iframe/`

### Unified Coverage Report

To run all tests and merge coverage reports:

```bash
pnpm nx run hermes:test/coverage
```

This will:
1. Run all test suites in parallel with coverage
2. Generate individual coverage reports
3. Merge all reports into `coverage/libs/hermes/merged/`

## Writing Tests

### Test File Location

Place test files alongside the code they test:

```
src/worker/
├── message-client.ts
├── message-client.spec.ts        # Test file
├── message-host.ts
└── message-host.spec.ts          # Test file
```

### Test File Naming

Use the `.spec.ts` or `.test.ts` suffix for test files.

### Environment-Specific Tests

Each submodule's test configuration automatically determines the appropriate test environment:

- **Core**: Node.js environment
- **Worker/Chrome/Broadcast/Iframe**: Browser environment (Playwright with Chromium)

### Example Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { MessageClient } from './message-client';

describe('MessageClient', () => {
  it('should create a client instance', () => {
    const client = new MessageClient();
    expect(client).toBeDefined();
  });

  it('should send messages', async () => {
    const client = new MessageClient();
    const result = await client.send('test', { data: 'value' });
    expect(result).toBeDefined();
  });
});
```

## Adding New Submodules

To add a new submodule with tests:

1. Create the submodule directory under `src/`
2. Create a `vitest.config.ts` file in the submodule directory
3. Configure the appropriate test environment (Node.js or Browser)
4. Create test files alongside your code
5. Add a test task in `project.json`
6. Include the task in the main `test` target

### Example Configuration Template

For a Node.js submodule:

```typescript
/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: path.join(__dirname, '..'),
  cacheDir: '../../../node_modules/.vite/libs/hermes-yourmodule',
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/yourmodule/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      clean: true,
      reportsDirectory: path.join(__dirname, '../../../coverage/libs/hermes/yourmodule'),
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/yourmodule/**/*.ts'],
      exclude: [
        '**/index.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
      ],
    },
  },
}));
```

For a Browser submodule:

```typescript
/// <reference types='vitest' />
import { defineConfig } from 'vite';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: path.join(__dirname, '..'),
  cacheDir: '../../../node_modules/.vite/libs/hermes-yourmodule',
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: process.env.HEADLESS !== 'false',
    },
    include: ['src/yourmodule/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      clean: true,
      reportsDirectory: path.join(__dirname, '../../../coverage/libs/hermes/yourmodule'),
      provider: 'istanbul', // Use istanbul for browser tests
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/yourmodule/**/*.ts'],
      exclude: [
        '**/index.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
      ],
    },
  },
}));
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install Playwright browsers
  run: pnpm nx run hermes:test/prepare/browser

- name: Run all tests with coverage
  run: pnpm nx run hermes:test/coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    directory: ./coverage/libs/hermes/
    flags: hermes
    fail_ci_if_error: false
    token: ${{ secrets.CODECOV_TOKEN }}
```

### Coverage Flags

The library uses coverage flags in `codecov.yml` to track coverage for each submodule:

- `core`: Core functionality
- `worker`: Web Worker communication
- `chrome`: Chrome extension APIs
- `broadcast`: Broadcast Channel API
- `iframe`: iframe communication

## Troubleshooting

### Browser Tests Failing

If browser tests fail with Playwright errors:

```bash
# Install/update Playwright browsers
pnpm nx run hermes:test/prepare/browser
```

### Coverage Not Generated

Ensure you're running tests with coverage enabled:

```bash
pnpm nx run hermes:test/coverage  # Coverage is enabled automatically
```

### Tests Running in Wrong Environment

Check the `vitest.*.config.ts` file for the submodule and verify:
- Core tests should have `environment: 'node'`
- Browser tests should have `browser: { enabled: true }` and `provider: 'istanbul'`

## Best Practices

1. **Keep tests close to code**: Place test files in the same directory as the code they test
2. **Test in isolation**: Each submodule's tests should be independent
3. **Use appropriate environment**: Choose Node.js or Browser environment based on the code being tested
4. **Mock external dependencies**: Use Vitest's mocking capabilities for external APIs
5. **Write descriptive test names**: Test names should clearly describe what they test
6. **Maintain coverage**: Aim for high test coverage across all submodules
