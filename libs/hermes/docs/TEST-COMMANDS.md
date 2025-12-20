# Hermes Test Commands - Quick Reference

## Most Common Commands

```bash
# Run all tests (unit + browser in parallel) - Use in CI
pnpm nx test hermes

# Run unit tests only (fast, Node.js)
pnpm nx test:unit hermes

# Run browser tests (slower, requires Chromium)
pnpm nx test:browser hermes

# Debug browser tests with visible browser
pnpm nx test:browser:headed hermes
```

## All Available Commands

| Command | Description | Environment | Speed |
|---------|-------------|-------------|-------|
| `pnpm nx test hermes` | Unit + Browser (parallel) | Node + Chromium | Medium |
| `pnpm nx test:all hermes` | All platforms (parallel) | All | Slowest |
| `pnpm nx test:unit hermes` | Core functionality | Node | Fast |
| `pnpm nx test:browser hermes` | Web Worker APIs | Chromium | Medium |
| `pnpm nx test:browser:headed hermes` | Debug browser tests | Chromium (visible) | Medium |
| `pnpm nx test:chrome hermes` | Chrome extensions | Chromium | Medium |
| `pnpm nx test:node hermes` | Child processes | Node | Fast |

## Watch Mode

```bash
# Unit tests in watch mode
pnpm nx test:unit hermes --watch

# Browser tests with UI
pnpm nx test:browser hermes --watch --ui
```

## Coverage

```bash
# With coverage
pnpm nx test:unit hermes --coverage
pnpm nx test:browser hermes --coverage

# View coverage reports
open coverage/libs/hermes/unit/index.html
open coverage/libs/hermes/browser/index.html
```

## CI/CD Examples

```bash
# GitHub Actions - Fast (recommended)
pnpm nx test hermes

# GitHub Actions - Comprehensive
pnpm nx test:all hermes

# Pre-commit hook - Only affected
pnpm nx test:unit hermes

# Manual verification before PR
pnpm nx test:all hermes
```

## Test File Patterns

- `*.spec.ts` → `test:unit`
- `*.browser.spec.ts` → `test:browser`
- `*.chrome.spec.ts` → `test:chrome`
- `*.node.spec.ts` → `test:node`

## Common Issues

**Browser tests timeout**: Increase timeout in vitest.browser.config.ts
```typescript
test: {
  testTimeout: 10000, // 10 seconds
}
```

**Playwright not installed**: Run installer
```bash
pnpm exec playwright install chromium --with-deps
```

**Tests not found**: Check file naming pattern matches config

---

For detailed information, see [TESTING-GUIDE.md](./TESTING-GUIDE.md)
