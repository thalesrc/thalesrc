# Browser Testing for Hermes Workers

This directory contains browser-based tests for the Hermes Web Worker implementation using Vitest browser mode with Playwright.

## Prerequisites

The required packages are already included in the workspace root `package.json`:
- `@vitest/browser` - Vitest browser mode support
- `playwright` - Browser automation for running tests

Install dependencies if you haven't already:

```bash
pnpm install
```

The `test:browser` target automatically installs Playwright browsers before running tests, so no manual installation is needed.

## Running Browser Tests

```bash
# Run all browser tests
pnpm nx test:browser hermes

# Run browser tests in watch mode (with UI)
pnpm nx test:browser hermes --watch --ui

# Run with coverage
pnpm nx test:browser hermes --coverage
```

## Test Structure

- **`*.browser.spec.ts`** - Browser-specific tests that require real Web Worker API
- **`*.spec.ts`** - Standard unit tests that run in Node environment

## Browser Test Features

### Real Web Worker Environment
Tests run in actual Chromium browser with full Web Worker support:
- Real `Worker` constructor
- Real `postMessage` API
- Real message serialization/deserialization
- SharedArrayBuffer support (if needed)

### Test Patterns

#### Basic Worker Communication
```typescript
it('should communicate with worker', async () => {
  const worker = new Worker(/* worker code */);
  const client = new WorkerMessageClient(worker);
  
  class API extends WorkerMessageClient {
    @Request('echo')
    public echo(msg: string): Observable<string> {
      return null!;
    }
  }
  
  const api = new API(worker);
  const result = await firstValueFrom(api.echo('Hello'));
  
  expect(result).toBe('Worker says: Hello');
});
```

#### Bidirectional Communication
```typescript
it('should support bidirectional communication', async () => {
  class Service extends WorkerMessageService {
    @Request('getData')
    public getData(): Observable<Data> {
      return null!;
    }
    
    @Listen('processData')
    public processData(data: Data) {
      return [/* processed data */];
    }
  }
  
  const service = new Service(worker);
  const data = await firstValueFrom(service.getData());
  expect(data).toBeDefined();
});
```

## Configuration

Browser tests use `vitest.browser.config.ts`:
- **Browser**: Chromium (via Playwright)
- **Headless**: Yes (can be changed for debugging)
- **Test Pattern**: `**/*.browser.spec.ts`
- **Coverage**: Separate coverage report in `coverage/libs/hermes-browser`

## Debugging

### Visual Debugging
Run tests in headed mode:
```bash
pnpm nx test:browser:headed hermes
```

Or set the environment variable manually:
```bash
HEADLESS=false pnpm nx test:browser hermes
```

### Browser DevTools
Add `debugger` statements in your tests and they'll pause in the browser's DevTools.

## Troubleshooting

### Worker Creation Errors
If you see worker creation errors, ensure:
1. Worker code is valid JavaScript
2. Blob URLs are created correctly
3. Worker is terminated in `afterEach`

### Message Not Received
Check:
1. Message format matches expected structure
2. `postMessage` is called on correct target
3. Event listeners are set up before sending messages

### Performance
Browser tests are slower than unit tests:
- Use for integration testing only
- Keep unit tests in regular `.spec.ts` files
- Run browser tests separately in CI

## Best Practices

1. **Inline Workers**: Use `new Blob()` + `URL.createObjectURL()` for test workers
2. **Cleanup**: Always terminate workers in `afterEach()`
3. **Isolation**: Each test should create its own worker instance
4. **Timeouts**: Set appropriate timeouts for async operations
5. **Error Handling**: Test both success and error cases

## CI/CD Integration

Browser tests require Playwright browsers to be installed. In CI:

```bash
# Install Playwright browsers
npx playwright install chromium

# Run tests
pnpm nx test:browser hermes
```
