# @thalesrc/rx-utils

[![npm version](https://badge.fury.io/js/%40thalesrc%2Frx-utils.svg)](https://badge.fury.io/js/%40thalesrc%2Frx-utils)
[![Build Status](https://github.com/thalesrc/thalesrc/actions/workflows/rx-utils.publish.yml/badge.svg)](https://github.com/thalesrc/thalesrc/actions/workflows/rx-utils.publish.yml)
[![npm downloads](https://img.shields.io/npm/dm/@thalesrc/rx-utils.svg)](https://www.npmjs.com/package/@thalesrc/rx-utils)

Utility functions and operators for RxJS Observables.

## Installation

```bash
npm install @thalesrc/rx-utils
```

## Features

This library provides useful utilities for working with RxJS Observables:

- **toAsyncIteratable**: Convert RxJS Observables to AsyncIterables for use with `for await...of` loops
- **makeAsyncIterator**: Create an AsyncIterator from an Observable
- **shareLast**: RxJS operator that shares the last emitted value without reference counting
- **Static extension**: Optionally extend Observable prototype with async iterator support

## API

### toAsyncIteratable

Converts an RxJS Observable into an AsyncIterable, allowing you to use `for await...of` loops with Observables.

```typescript
import { of } from 'rxjs';
import { toAsyncIteratable } from '@thalesrc/rx-utils/to-async-iteratable';

const observable = of(1, 2, 3);
const asyncIterable = toAsyncIteratable(observable);

for await (const value of asyncIterable) {
  console.log(value); // 1, 2, 3
}
```

**Parameters:**
- `observable: Observable<T>` - The Observable to convert

**Returns:**
- `AsyncIterable<T>` - An AsyncIterable that yields values from the Observable

### makeAsyncIterator

Creates an AsyncIterator from an Observable. This function is used internally by `toAsyncIteratable` but can also be used directly if you need more control over the iteration process.

```typescript
import { of } from 'rxjs';
import { makeAsyncIterator } from '@thalesrc/rx-utils/to-async-iteratable';

const observable = of(1, 2, 3);
const asyncIterator = makeAsyncIterator(observable);

// Manually iterate
const result1 = await asyncIterator.next(); // { value: 1, done: false }
const result2 = await asyncIterator.next(); // { value: 2, done: false }
```

**Parameters:**
- `observable: Observable<T>` - The Observable to convert

**Returns:**
- `AsyncIterator<T>` - An AsyncIterator that yields values from the Observable

### shareLast (Operator)

An RxJS operator that shares the last emitted value from the source Observable without reference counting. This is equivalent to `shareReplay({ refCount: false, bufferSize: 1 })`.

```typescript
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { shareLast } from '@thalesrc/rx-utils/operators/share-last';

const source = interval(1000).pipe(
  take(5),
  shareLast()
);

// First subscriber gets all values
source.subscribe(value => console.log('Subscriber 1:', value));

// Second subscriber (even if subscribed later) gets the last emitted value immediately
setTimeout(() => {
  source.subscribe(value => console.log('Subscriber 2:', value));
}, 3000);
```

**Returns:**
- `MonoTypeOperatorFunction<T>` - An operator function that shares the last emitted value

### Static Extension (Optional)

You can optionally import the static extension to add async iterator support directly to Observable instances:

```typescript
import { of } from 'rxjs';
import '@thalesrc/rx-utils/static/async-iterator';

const observable = of(1, 2, 3);

// Now you can use for await...of directly on observables
for await (const value of observable) {
  console.log(value); // 1, 2, 3
}
```

**Note:** This modifies the Observable prototype globally. Only import this if you want all Observable instances in your application to have async iterator support.

## Usage Examples

### Converting HTTP Responses to Async Iterables

```typescript
import { HttpClient } from '@angular/common/http';
import { toAsyncIteratable } from '@thalesrc/rx-utils/to-async-iteratable';

class DataService {
  constructor(private http: HttpClient) {}

  async *getData() {
    const response$ = this.http.get<any[]>('/api/data');
    const asyncIterable = toAsyncIteratable(response$);
    
    for await (const data of asyncIterable) {
      yield data;
    }
  }
}
```
## TypeScript Support

This library is written in TypeScript and provides full type definitions. All functions are properly typed for the best development experience.

## Dependencies

- `rxjs`: For Observable support
- `@thalesrc/js-utils`: For OpenPromise utility (used internally)
- `tslib`: TypeScript runtime helpers

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
