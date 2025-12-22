# Hermes Testing Guide

This document explains the testing structure for the Hermes library, which supports multiple platforms and communication methods.

## Test Structure

Hermes is organized into platform-specific modules, each with its own test suite:

### Test Organization by Directory

Tests are organized by **directory structure** with a clear separation between unit tests and integration tests:

- **`src/**/*.spec.ts`** - Unit tests (Node.js environment)
  - Core functionality tests (decorators, base classes)
  - Worker class unit tests (mocked Worker API)
  - Fast execution, no browser dependencies
  
- **`src/worker/__tests__/**/*.spec.ts`** - Browser integration tests
  - Web Worker communication tests with real Worker API
  - Requires Chromium via Playwright
  - Tests actual postMessage, Worker lifecycle, etc.
  
- **`src/chrome/__tests__/**/*.spec.ts`** - Chrome extension integration tests (Future)
  - Chrome extension messaging APIs
  - Chrome runtime tests
  
- **`src/node/__tests__/**/*.spec.ts`** - Node.js integration tests (Future)
  - Child process communication
  - Node-specific features

**Key principle**: Unit tests (with mocks) live alongside source files. Integration tests (requiring real APIs) live in `__tests__/` subdirectories.

## Running Tests

### Run All Tests (Parallel)
```bash
# Run unit + browser tests in parallel (default for CI)
pnpm nx test hermes

# Run ALL platform tests in parallel (includes chrome, node when available)
pnpm nx test:all hermes
```

### Run Specific Test Suites

```bash
# Unit tests only (Node.js environment)
pnpm nx test:unit hermes

# Browser tests (headless Chromium)
pnpm nx test:browser hermes

# Browser tests with visible browser (for debugging)
pnpm nx test:browser:headed hermes

# Chrome extension tests (when implemented)
pnpm nx test:chrome hermes

# Node.js-specific tests (when implemented)
pnpm nx test:node hermes
```

### Coverage Reports

Coverage reports are organized by platform:
- `coverage/libs/hermes/unit` - Unit test coverage
- `coverage/libs/hermes/browser` - Browser test coverage
- `coverage/libs/hermes/chrome` - Chrome test coverage
- `coverage/libs/hermes/node` - Node.js test coverage

## Test Configuration Files

Each platform has its own Vitest configuration:

- `vitest.config.ts` - Unit tests configuration
- `vitest.browser.config.ts` - Browser tests configuration
- `vitest.chrome.config.ts` - Chrome extension tests configuration
- `vitest.node.config.ts` - Node.js tests configuration

### Setup Files

- `setup-test.ts` - Unit test setup
- `setup-browser-test.ts` - Browser test setup
- `setup-chrome-test.ts` - Chrome extension test setup
- `setup-node-test.ts` - Node.js test setup

## GitHub Actions / CI

For CI environments, use the default test target which runs unit and browser tests in parallel:

```yaml
- name: Test
  run: pnpm nx test hermes
```

For comprehensive testing (including all platforms):

```yaml
- name: Test All Platforms
  run: pnpm nx test:all hermes
```

### CI Optimization

The test targets use `passWithNoTests: true` to avoid failures when platform-specific tests don't exist yet.

## Writing Tests

### Unit Tests (src/**/*.spec.ts, excluding platform directories)

Standard Vitest tests in Node.js environment:

```typescript
import { describe, it, expect } from 'vitest';
import { MyClass } from './my-class';

describe('MyClass', () => {
  it('should work', () => {
    const instance = new MyClass();
    expect(instance).toBeDefined();
  });
});
```

### Browser Tests (src/worker/**/*.spec.ts)

Tests that require real browser APIs (Web Workers, DOM, etc.):

```typescript
import { describe, it, expect } from 'vitest';
import { WorkerMessageClient } from './message-client';

describe('WorkerMessageClient (Browser)', () => {
  it('should communicate with worker', () => {
    const worker = new Worker(/* ... */);
    const client = new WorkerMessageClient(worker);
    // Test real Worker API
  });
});
```

### Chrome Tests (src/chrome/**/*.spec.ts)

Tests for Chrome extension APIs (future):

```typescript
import { describe, it, expect } from 'vitest';
import { ChromeMessageClient } from './message-client';

describe('ChromeMessageClient', () => {
  it('should send messages via chrome.runtime', () => {
    // Test Chrome extension messaging
  });
});
```

### Node Tests (src/node/**/*.spec.ts)

Tests for Node.js-specific features like child processes (future):

```typescript
import { describe, it, expect } from 'vitest';
import { ChildProcessMessageClient } from './message-client';

describe('ChildProcessMessageClient', () => {
  it('should communicate with child process', () => {
    // Test child process communication
  });
});
```

## Debugging

### Visual Browser Debugging

Run browser tests with a visible browser:

```bash
pnpm nx test:browser:headed hermes
```

Add `debugger` statements in your tests to pause execution.

### Watch Mode

```bash
# Unit tests in watch mode
pnpm nx test:unit hermes --watch

# Browser tests in watch mode with UI
pnpm nx test:browser hermes --watch --ui
```

## Best Practices

1. **Platform Isolation**: Keep platform-specific code in separate directories (`worker/`, `chrome/`, `node/`)
2. **Test Naming**: Use clear suffixes (`.browser.spec.ts`, `.chrome.spec.ts`, etc.)
3. **Parallel Execution**: Platform tests run in parallel for faster CI
4. **Shared Code**: Keep shared test utilities in the base `src/` directory
5. **Coverage**: Each platform has separate coverage reports for clarity

## Future Platforms

When adding new platforms:

1. Create `vitest.<platform>.config.ts` in `config/` directory
2. Create `setup-<platform>-test.ts` in `config/` directory
3. Add `test:<platform>` target in `project.json`
4. Update `test:all` to include the new platform
5. Create platform directory: `src/<platform>/`
6. Write tests in: `src/<platform>/**/*.spec.ts`

Example for a new platform like "electron":

```bash
# Create config
touch config/vitest.electron.config.ts

# Create setup file
touch config/setup-electron-test.ts

# Create platform directory
mkdir src/electron

# Add target to project.json
# "test:electron": { ... }

# Write tests
touch src/electron/messaging.spec.ts
```
