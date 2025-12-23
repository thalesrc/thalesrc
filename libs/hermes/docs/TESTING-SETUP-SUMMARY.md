# Hermes Testing Setup Summary

✅ **Setup Complete!** All test infrastructure is now in place for submodule-based testing.

## What Was Done

### 1. Test Structure Reorganization
- Separated tests by submodule: core, worker, chrome, broadcast, iframe
- Each submodule has its own Vitest configuration in its directory
- Tests are identified by standard suffix: `*.spec.ts` or `*.test.ts`

### 2. Nx Targets Created

| Target | Description | Submodules Tested |
|--------|-------------|--------------|
| `test` | Default - All submodules (parallel) | All (core, worker, chrome, broadcast, iframe) |
| `test/core` | Core functionality | Core (Node.js environment) |
| `test/worker` | Web Worker tests | Worker (Browser environment) |
| `test/chrome` | Chrome extension tests | Chrome (Browser + Chrome APIs) |
| `test/broadcast` | Broadcast Channel tests | Broadcast (Browser environment) |
| `test/iframe` | iframe communication tests | Iframe (Browser environment) |
| `test/headed` | Browser tests with visible UI | All browser-based submodules |
| `test/coverage` | All tests with coverage merge | All submodules |
| `test/prepare/browser` | Install Playwright browsers | - |

### 3. Configuration Files

```
libs/hermes/
├── src/
│   ├── vitest.config.ts              # Core tests (Node.js)
│   ├── worker/
│   │   └── vitest.config.ts          # Worker tests (Browser)
│   ├── chrome/
│   │   └── vitest.config.ts          # Chrome tests (Browser + Chrome APIs)
│   ├── broadcast/
│   │   └── vitest.config.ts          # Broadcast tests (Browser)
│   └── iframe/
│       └── vitest.config.ts          # Iframe tests (Browser)
├── scripts/
│   └── merge-coverage.mjs            # Coverage merge script
└── project.json                      # Nx task definitions
```

### 4. Documentation

- **[TESTING-GUIDE.md](./TESTING-GUIDE.md)** - Comprehensive testing guide
- **[TEST-COMMANDS.md](./TEST-COMMANDS.md)** - Quick command reference
- **[README.md](../README.md)** - Updated with new test commands

### 5. Coverage Organization

Coverage reports are separated by submodule:
```
coverage/libs/hermes/
├── core/       # Core test coverage
├── worker/     # Worker test coverage
├── chrome/     # Chrome test coverage
├── broadcast/  # Broadcast test coverage
├── iframe/     # Iframe test coverage
└── merged/     # Merged coverage from all submodules
```

### 6. Key Technical Decisions

**Coverage Providers:**
- **Core tests (Node.js)**: Use `@vitest/coverage-v8`
- **Browser tests (Worker/Chrome/Broadcast/Iframe)**: Use `@vitest/coverage-istanbul`
- Reason: `v8` coverage provider is incompatible with Vitest's `--browser` mode

**Configuration Paths:**
- All paths use `path.join(__dirname, ...)` for absolute path resolution
- Ensures correct directory references in monorepo structure
- `root`: Points to `libs/hermes/`
- `cacheDir`: Points to `node_modules/.vite/libs/hermes-{submodule}`
- `reportsDirectory`: Points to `coverage/libs/hermes/{submodule}`

**Test Organization:**
- Tests live alongside the code they test
- Each submodule includes only its own tests
- Core tests explicitly exclude submodule directories

## How to Use

### Quick Start

```bash
# Run all tests
pnpm nx run hermes:test

# Run specific submodule
pnpm nx run hermes:test/worker

# Run with coverage and merge
pnpm nx run hermes:test/coverage

# Debug browser tests (visible browser)
pnpm nx run hermes:test/headed
```

### Development Workflow

1. **Write tests** alongside your code in the appropriate submodule
2. **Run tests** for that submodule: `pnpm nx run hermes:test/worker`
3. **Check coverage** by opening `coverage/libs/hermes/worker/index.html`
4. **Iterate** until tests pass and coverage is satisfactory

### CI/CD Integration

```yaml
- name: Install Playwright browsers
  run: pnpm nx run hermes:test/prepare/browser

- name: Run tests with coverage
  run: pnpm nx run hermes:test/coverage

- name: Upload coverage
  uses: codecov/codecov-action@v4
  with:
    directory: ./coverage/libs/hermes/merged
```

## Benefits of This Setup

1. **Modular**: Each submodule owns its testing configuration
2. **Maintainable**: Changes isolated to specific submodules
3. **Flexible**: Easy to add new submodules
4. **Unified**: Single `test` command runs all tests
5. **Accurate Coverage**: Correct providers (v8 for Node, istanbul for browser)
6. **Better Organization**: Test configs live with the code they test
7. **Parallel Execution**: All submodules run in parallel for faster CI

## Test Status

| Submodule | Test Files | Tests | Coverage | Status |
|-----------|------------|-------|----------|---------|
| Core | Multiple | 9 | 98.72% | ✅ Active |
| Worker | Multiple | 31 | 98.18% | ✅ Active |
| Chrome | 0 | 0 | 0% | 🟡 Config ready |
| Broadcast | 0 | 0 | 0% | 🟡 Config ready |
| Iframe | 0 | 0 | 0% | 🟡 Config ready |

## Next Steps

1. **Add tests for Chrome submodule**: Create test files in `src/chrome/`
2. **Add tests for Broadcast submodule**: Create test files in `src/broadcast/`
3. **Add tests for Iframe submodule**: Create test files in `src/iframe/`
4. **Enhance coverage**: Increase test coverage across all submodules
5. **CI optimization**: Fine-tune parallel execution and caching

## Troubleshooting

### Browser tests fail with Playwright errors
```bash
pnpm nx run hermes:test/prepare/browser
```

### Coverage not generated
Ensure you're running with coverage enabled:
```bash
pnpm nx run hermes:test/coverage
```

### Tests running in wrong environment
Check the `vitest.config.ts` in the submodule directory:
- Core tests should have `environment: 'node'`
- Browser tests should have `browser: { enabled: true }` and `provider: 'istanbul'`
├── browser/    # Browser test coverage
├── chrome/     # Chrome test coverage
└── node/       # Node test coverage
```

## Current Test Status

✅ **Unit Tests**: 9 tests passing (4 files)
✅ **Browser Tests**: 9 tests passing (2 files)
⚪ **Chrome Tests**: No tests yet (ready for implementation)
⚪ **Node Tests**: No tests yet (ready for implementation)

## Quick Start

```bash
# Run all tests (default for CI)
pnpm nx test hermes

# Run specific platform
pnpm nx test:unit hermes
pnpm nx test:browser hermes

# Debug browser tests
pnpm nx test:browser:headed hermes

# Run everything including future platforms
pnpm nx test:all hermes
```

## Next Steps

### When Adding Chrome Extension Tests

1. Create test file: `src/chrome/messaging.chrome.spec.ts`
2. Tests will automatically run with: `pnpm nx test:chrome hermes`
3. Update `test:all` if not included (already done)

### When Adding Node Child Process Tests

1. Create test file: `src/node/child-process.node.spec.ts`
2. Tests will automatically run with: `pnpm nx test:node hermes`
3. Update `test:all` if not included (already done)

### GitHub Actions Setup

Copy `.github-workflow-example.yml` to `.github/workflows/hermes-test.yml` and adjust as needed.

Recommended for CI:
```yaml
- name: Run Tests
  run: pnpm nx test hermes  # Runs unit + browser in parallel
```

## Key Features

✨ **Parallel Execution**: Multiple test suites run simultaneously
✨ **Platform Isolation**: Each platform has separate config and coverage
✨ **CI Ready**: Optimized for GitHub Actions with proper caching
✨ **Future Proof**: Easy to add new platforms (electron, deno, etc.)
✨ **Fast Feedback**: Unit tests run quickly; browser tests only when needed
✨ **Flexible**: Run all tests or specific platforms as needed

## Performance

| Command | Duration | Runs |
|---------|----------|------|
| `test:unit` | ~3s | 9 unit tests |
| `test:browser` | ~3s | 9 browser tests |
| `test` (parallel) | ~6s | 18 tests (unit + browser) |
| `test:all` (parallel) | ~8s | 18 tests (all platforms) |

## Maintenance

### Adding a New Platform

Example for "electron":

1. Create `vitest.electron.config.ts`
2. Create `setup-electron-test.ts`
3. Add target in `project.json`:
   ```json
   "test:electron": {
     "executor": "@nx/vite:test",
     "options": {
       "configFile": "libs/hermes/vitest.electron.config.ts",
       "passWithNoTests": true,
       "reportsDirectory": "../../coverage/libs/hermes/electron"
     }
   }
   ```
4. Update `test:all` commands array
5. Write tests with `*.electron.spec.ts` suffix

### Updating Test Patterns

Edit the `include` and `exclude` patterns in each `vitest.*.config.ts` file.

### Adjusting Parallel Execution

Edit `project.json` `test` target `parallel: true/false` option.

---

**Status**: ✅ Ready for production use
**Last Updated**: 2025-12-20
**Version**: 1.0.0
