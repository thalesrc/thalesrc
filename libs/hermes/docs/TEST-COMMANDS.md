# Hermes Test Commands - Quick Reference

## Most Common Commands

```bash
# Run all tests (all submodules in parallel) - Use in CI
pnpm nx run hermes:test

# Run specific submodule tests
pnpm nx run hermes:test/core        # Core functionality (Node.js)
pnpm nx run hermes:test/worker      # Web Worker tests (Browser)

# Run tests with coverage and merge reports
pnpm nx run hermes:test/coverage
```

## All Available Commands

| Command | Description | Environment | Speed |
|---------|-------------|-------------|-------|
| `pnpm nx run hermes:test` | All submodules (parallel) | Mixed | Medium |
| `pnpm nx run hermes:test/core` | Core functionality | Node | Fast |
| `pnpm nx run hermes:test/worker` | Web Worker APIs | Browser (Chromium) | Medium |
| `pnpm nx run hermes:test/chrome` | Chrome extensions | Browser + Chrome APIs | Medium |
| `pnpm nx run hermes:test/broadcast` | Broadcast Channel | Browser (Chromium) | Medium |
| `pnpm nx run hermes:test/iframe` | iframe communication | Browser (Chromium) | Medium |
| `pnpm nx run hermes:test/coverage` | All tests + merge coverage | Mixed | Slowest |
| `pnpm nx run hermes:test/prepare/browser` | Install Playwright browsers | - | Slow |

## Watch Mode

```bash
# Core tests in watch mode
pnpm nx run hermes:test/core -- --watch

# Worker tests in watch mode with UI
pnpm nx run hermes:test/worker -- --watch --ui

# All tests in watch mode
pnpm nx run hermes:test -- --watch
```

## Coverage

```bash
# Run single submodule with coverage
pnpm nx run hermes:test/core:with-coverage
pnpm nx run hermes:test/worker:with-coverage

# Run all tests with coverage and merge
pnpm nx run hermes:test/coverage

# View coverage reports
open coverage/libs/hermes/core/index.html
open coverage/libs/hermes/worker/index.html
open coverage/libs/hermes/merged/index.html  # Merged report
```

## CI/CD Examples

```bash
# GitHub Actions - Install Playwright first
pnpm nx run hermes:test/prepare/browser

# GitHub Actions - Run all tests with coverage
pnpm nx run hermes:test/coverage

# Pre-commit hook - Only affected
pnpm nx run hermes:test

# Manual verification before PR
pnpm nx run hermes:test/coverage
```

## Test File Patterns

Tests are organized by submodule location:

- `src/**/*.spec.ts` (excluding submodules) → `test/core`
- `src/worker/**/*.spec.ts` → `test/worker`
- `src/chrome/**/*.spec.ts` → `test/chrome`
- `src/broadcast/**/*.spec.ts` → `test/broadcast`
- `src/iframe/**/*.spec.ts` → `test/iframe`

Both `*.spec.ts` and `*.test.ts` suffixes are supported.

## Common Issues

**Browser tests timeout**: Increase timeout in the submodule's vitest.config.ts
```typescript
test: {
  testTimeout: 10000, // 10 seconds
}
```

**Playwright not installed**: Run installer
```bash
pnpm nx run hermes:test/prepare/browser
# or
pnpm exec playwright install chromium --with-deps
```

**Tests not found**: 
- Check file is in the correct submodule directory
- Verify file has `.spec.ts` or `.test.ts` suffix
- Check the submodule's vitest.config.ts include pattern

**Coverage not generated**:
- Use `test/coverage` target for merged coverage
- Or use `test/{submodule}:with-coverage` for individual submodule
- Check that `@vitest/coverage-istanbul` and `@vitest/coverage-v8` are installed

**Wrong coverage provider error**:
- Browser tests must use `istanbul` provider
- Node.js tests must use `v8` provider
- This is already configured correctly in each submodule's config

## Environment Variables

```bash
# Run browser tests in visible mode (for debugging)
HEADLESS=false pnpm nx run hermes:test/worker

# Or use the dedicated headed target
pnpm nx run hermes:test/headed
```

## Passing Additional Vitest Options

```bash
# Pass options after --
pnpm nx run hermes:test/worker -- --reporter=verbose

# Run specific test file
pnpm nx run hermes:test/worker -- message-client.spec.ts

# Run tests matching a pattern
pnpm nx run hermes:test/worker -- -t "should send message"

# Run with browser headless override
pnpm nx run hermes:test/worker -- --browser.headless=false
```

---

For detailed information, see [TESTING-GUIDE.md](./TESTING-GUIDE.md)
