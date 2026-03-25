# @telperion/rx-utils

[![npm version](https://badge.fury.io/js/%40telperion%2Frx-utils.svg)](https://badge.fury.io/js/%40telperion%2Frx-utils)
[![Build Status](https://github.com/telperiontech/telperion/actions/workflows/rx-utils.publish.yml/badge.svg)](https://github.com/telperiontech/telperion/actions/workflows/rx-utils.publish.yml)
[![npm downloads](https://img.shields.io/npm/dm/@telperion/rx-utils.svg)](https://www.npmjs.com/package/@telperion/rx-utils)

Utility functions and operators for RxJS Observables.

## Installation

```bash
npm install @telperion/rx-utils
```

## Features

This library provides useful utilities for working with RxJS Observables:

- **toAsyncIteratable**: Convert RxJS Observables to AsyncIterables for use with `for await...of` loops
- **makeAsyncIterator**: Create an AsyncIterator from an Observable
- **pluck**: RxJS operator that emits the value of a specified key from the source object
- **shareLast**: RxJS operator that shares the last emitted value without reference counting
- **fromCallback**: Convert callback-based functions into Observables
- **debounceTimeBuffer**: RxJS operator that buffers values and emits them as an array after a silence period
- **Static extension**: Optionally extend Observable prototype with async iterator support

## API

### toAsyncIteratable

Converts an RxJS Observable into an AsyncIterable, allowing you to use `for await...of` loops with Observables.

```typescript
import { of } from 'rxjs';
import { toAsyncIteratable } from '@telperion/rx-utils/to-async-iteratable';

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
import { makeAsyncIterator } from '@telperion/rx-utils/to-async-iteratable';

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

### pluck (Operator)

An RxJS operator that emits the value of a specified key from the source object. A type-safe replacement for the deprecated RxJS `pluck` operator.

```typescript
import { of } from 'rxjs';
import { pluck } from '@telperion/rx-utils/operators';

of({ name: 'Alice', age: 30 }).pipe(
  pluck('name')
).subscribe(console.log);
// Output: "Alice"
```

**Parameters:**
- `key: K` - The key to pluck from the source object

**Returns:**
- `OperatorFunction<T, T[K]>` - An operator function that maps each source object to the value of the specified key

### shareLast (Operator)

An RxJS operator that shares the last emitted value from the source Observable without reference counting. This is equivalent to `shareReplay({ refCount: false, bufferSize: 1 })`.

```typescript
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { shareLast } from '@telperion/rx-utils/operators/share-last';

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

### fromCallback

Wraps a callback-based function into an RxJS Observable that emits once when the callback is invoked, then completes. An optional mapper function can transform the callback arguments before emission.

```typescript
import { fromCallback } from '@telperion/rx-utils/from-callback';

// Basic usage — emits callback arguments as a tuple
fromCallback<(value: string) => void>(cb => setTimeout(() => cb('hello'), 100))
  .subscribe(([value]) => console.log(value)); // 'hello'

// With a mapper to transform callback arguments
fromCallback<(err: Error | null, data: string) => void>(
  cb => someAsyncFn(cb),
  (_err, data) => data
).subscribe(content => console.log(content));
```

**Parameters:**
- `fn: (callback: C) => any` - A function that receives an internally-created callback. Invoke the callback to emit a value.
- `mapper?: M` *(optional)* - A function that transforms the callback arguments into the desired emission value. When omitted, the Observable emits the raw callback arguments as a tuple.

**Returns:**
- `Observable<Parameters<C>>` - When no mapper is provided, emits the callback arguments as a tuple.
- `Observable<ReturnType<M>>` - When a mapper is provided, emits the mapper's return value.

### debounceTimeBuffer (Operator)

An RxJS operator that buffers source Observable values and emits them as an array once a specified silence period (`dueTime`) has passed with no new emissions. Combines `buffer` and `debounceTime` internally.

```typescript
import { Subject } from 'rxjs';
import { debounceTimeBuffer } from '@telperion/rx-utils/operators';

const subject = new Subject<number>();

subject.pipe(
  debounceTimeBuffer(300)
).subscribe(console.log);

subject.next(1);
subject.next(2);
subject.next(3);
// After 300ms of silence: [1, 2, 3]
```

**Parameters:**
- `dueTime: number` - The timeout duration in milliseconds to wait for emission silence before emitting the buffered array.

**Returns:**
- `OperatorFunction<T, T[]>` - An operator function that emits arrays of buffered values from the source Observable.

### Static Extension (Optional)

You can optionally import the static extension to add async iterator support directly to Observable instances:

```typescript
import { of } from 'rxjs';
import '@telperion/rx-utils/static/async-iterator';

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
import { toAsyncIteratable } from '@telperion/rx-utils/to-async-iteratable';

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
- `@telperion/js-utils`: For OpenPromise utility (used internally)
- `tslib`: TypeScript runtime helpers

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
