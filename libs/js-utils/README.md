# @telperion/js-utils
Javascript utility functions for web development

[![npm](https://img.shields.io/npm/v/@telperion/js-utils.svg)](https://www.npmjs.com/package/@telperion/js-utils)
[![npm](https://img.shields.io/npm/dm/@telperion/js-utils.svg)](https://www.npmjs.com/package/@telperion/js-utils)
[![codecov](https://codecov.io/gh/telperiontech/telperion/graph/badge.svg?token=dz46LY3onk&flag=js-utils)](https://app.codecov.io/gh/telperiontech/telperion/tree/main?flags%5B0%5D=js-utils)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![npm](https://img.shields.io/npm/l/@telperion/js-utils.svg)](https://github.com/telperiontech/telperion/blob/main/LICENSE)

## Motivation

Collecting commonly used utility functions in a package.

## Goals

* Typescript support
* Tree-shaking
* No dependencies
* High performance
* Documentation
* High test coverage
* Static/Prototype method support

## Installation
* npm: `npm install @telperion/js-utils --save`
* yarn: `yarn add @telperion/js-utils`
* pnpm: `pnpm i -S @telperion/js-utils`

## Documentation

See: [open-source.telperion.tr/js-utils](https://open-source.telperion.tr/js-utils)

## Functions

### Array

#### [Async Map](https://open-source.telperion.tr/js-utils/modules/_array_async_map_.html)
Maps an array asynchronously

```typescript
import { asyncMap } "@telperion/js-utils/array";

const array = [1, 2, 3];

const result = await asyncMap(array, async value => {
 return await addOneAfterASecond(value);
});

console.log(result); // [2, 3, 4]
```

#### [Compact](https://open-source.telperion.tr/js-utils/modules/_array_compact_.html)
Filters falsy values of an array

```typescript
import { compact } from "@telperion/js-utils/array";

const arr = [undefined, "", false, 0, 1, "1", null];
const compacted = compact(arr); // [1, "1"];
```

#### [Difference](https://open-source.telperion.tr/js-utils/modules/_array_difference_.html)
Gets the difference of the two arrays or sets

```typescript
import { difference } from "@telperion/js-utils/array";

const base = ["a", "b", "c", "d", "a", "b", "c", "d"];

difference(base, ["a", "b"]); // ["c", "d", "c", "d"]
difference(base, ["a", "b"], true); // ["c", "d", "a", "b", "c", "d"]
```

#### [Find By Key](https://open-source.telperion.tr/js-utils/modules/_array_find_by_key_.html)
Finds an object in an array by matching the value set on the key

```typescript
import { findByKey } from "@telperion/js-utils/array";

const array = [{a: 1}, {a: 2}, {a: 3}];

findByKey(array, "a", 2); // {a: 2}
```

#### [Intersection](https://open-source.telperion.tr/js-utils/modules/_array_intersection_.html)
Gets the intersection of the two arrays or sets

```typescript
import { intersection } from "@telperion/js-utils/array";

const base = ["a", "b", "c", "d", "a", "b", "c", "d"];

intersection(base, ["a", "b", "x"]); // ["a", "b", "a", "b"]
intersection(base, ["a", "b", "x"], false); // ["a", "b"]
```

#### [Limit](https://open-source.telperion.tr/js-utils/modules/_array_limit_.html)
Returns first `n` children of an array

```typescript
import { limit } from "@telperion/js-utils/array";

const array = ["a", "b", "c", "d", "e", "f"];

limit(array, 3); // ["a", "b", "c"]
```

#### [Remove](https://open-source.telperion.tr/js-utils/modules/_array_remove_.html)
Removes an item from an array

```typescript
import { remove } from "@telperion/js-utils/array";

const array = ["a", "b", "c", "a", "b", "c"];

remove(array, "b"); // ["a", "c", "a", "b", "c"]
remove(array, "b", true); // ["a", "c", "a", "c"]
```

#### [Replace](https://open-source.telperion.tr/js-utils/modules/_array_replace_.html)
Replaces an item with passed one of an array

```typescript
import { replace } from "@telperion/js-utils/array";

const array = ["a", "b", "c", "a", "b", "c"];

replace(array, "b", "x"); // ["a", "x", "c", "a", "b", "c"]
replace(array, {startingIndex: 3, deleteCount: 1, itemsToReplace: ['x', 'y']}); // ["a", "b", "c", "x", "y", "b", "c"];

const config = new Map();
config.set("a", "x")
config.set("b", "y");

replace(array, {itemsToReplace: config}); // ["x", "y", "c", "a", "b", "c"];
replace(array, {itemsToReplace: config, multi: true}); // ["x", "y", "c", "x", "y", "c"];
```

#### [Uniquify](https://open-source.telperion.tr/js-utils/modules/_array_uniquify_.html)
Removes repeated items from the array

```typescript
import { uniquify } "@telperion/js-utils/array";

const array = ["a", "b", "c", "a", "b", "c"];

uniquify(array); // ["a", "b", "c"]
```

#### [Uniquify By Key](https://open-source.telperion.tr/js-utils/modules/_array_uniquify_by_key_.html)
Removes objects from the array which the value of its specifed key included before by another

```typescript
import { uniquifyByKey } "@telperion/js-utils/array";

const array = [{a: 1}, {a: 1}, {a: 2}, {a: 3}, {a: 3}, {a: 4}];

uniquifyByKey(array, 'a'); // [{a: 1}, {a: 2}, {a: 3}, {a: 4}]
```

### Class

#### [Mixin](https://open-source.telperion.tr/js-utils/modules/_class_mixin_.html)
Creates a class that combines two classes using the mixin pattern

```typescript
import { mixin } from "@telperion/js-utils/class";

class Timestamped {
  timestamp = Date.now();
  getAge() {
    return Date.now() - this.timestamp;
  }
}

class User {
  constructor(public name: string) {}
  greet() {
    return `Hello, ${this.name}`;
  }
}

class TimestampedUser extends mixin(User, Timestamped) {}

const user = new TimestampedUser(['John'], []);
console.log(user.greet()); // "Hello, John"
console.log(user.getAge()); // Time since creation
```

### Function

#### [Debounce](https://open-source.telperion.tr/js-utils/modules/_function_debounce_.html)
Debounces a function that delays invoking until after configured time have elapsed since the last time the debounced function was invoked

```typescript
import { debounce } from "@telperion/js-utils/promise";

function foo() {
  console.log("hello");
}

for (let i = 0; i < 10; i++) {
  debounce(foo);
}

// logs "hello" only once
```

#### [Defer](https://open-source.telperion.tr/js-utils/modules/_function_defer_.html)
Delays the execution of the passed function

```typescript
import { defer } from "@telperion/js-utils/function";

const result = await defer(() => aFunctionToDeferThatReturnsHello());

console.log(result); // 'hello'
```

#### [Noop](https://open-source.telperion.tr/js-utils/modules/_function_noop_.html)
Noop function

```typescript
import { noop } from "@telperion/js-utils/function";

noop();
```

#### [Of](https://open-source.telperion.tr/js-utils/modules/_function_of_.html)
Creates a function which returns the specified value

```typescript
import { of } from "@telperion/js-utils/function";

const base = [1, 2, 5, {}, "x", "y"];

base.map(of('hi')); // ["hi", "hi", "hi", "hi", "hi", "hi"]
```

### Map

#### [Merge](https://open-source.telperion.tr/js-utils/modules/_map_merge_.html)
Merges two maps

```typescript
import { merge } from "@telperion/js-utils/map";

const first = new Map();
first.set("a", 1);

const second = new Map();
second.set("b", 2);
merge(first, second); // [{key: "a", value: 1}, {key: "b", value: 2}]
```

### Math

#### [Min-Max](https://open-source.telperion.tr/js-utils/modules/_math_min_max_.html)
Limits the value by specified range

```typescript
import { minMax } from "@telperion/js-utils/math";

const limitedValue = minMax(200, 300, Math.random() * 1000); // Outputs between 200-300
```

### Object

#### [Clone](https://open-source.telperion.tr/js-utils/modules/_object_clone_.html)
A function to deep clone anything (recursively)

```typescript
import { clone } from "@telperion/js-utils/object";

const object = {a: 1, b: {c: true, d: ["x", "y"]}};

const clonedObject = clone(object);
// {a: 1, b: {c: true, d: ["x", "y"]}}
// object.b.d === clonedObject.b.d // false
```

#### [Compact](https://open-source.telperion.tr/js-utils/modules/_object_compact_.html)
Removes `null` and `undefined` values and their keys from an object

```typescript
import { compact } from "@telperion/js-utils/object";

const a = {
 x: null,
 y: undefined,
 z: 20
};

compact(a); // {z: 20}
```

#### [Map](https://open-source.telperion.tr/js-utils/modules/_object_map_.html)
Maps the values of an object using a callback function

```typescript
import { map } from "@telperion/js-utils/object";

const obj = { a: 1, b: 2, c: 3 };

map(obj, value => value * 2); // { a: 2, b: 4, c: 6 }
```

#### [Deepest](https://open-source.telperion.tr/js-utils/modules/_object_deepest_.html)
Get deepest value in an object chain

```typescript
import { deepest } from "@telperion/js-utils/object";

const a = {x: null};
const b = {x: a};
const c = {x: b};

deepest(c, 'x'); // {x: null} (a)
```

### Promise

#### [Chain](https://open-source.telperion.tr/js-utils/modules/_promise_chain_.html)
Chains promises in a sequential order

```typescript
import { chain } from '@telperion/js-utils/promise';

const lastResult = await chain([() => getUserDetails(), ({photoUrl}) => getUserPhoto(photoUrl)]);
```

#### [Never](https://open-source.telperion.tr/js-utils/modules/_promise_never_.html)
A promise which never resolves

```typescript
import { never, NEVER } from '@telperion/js-utils/promise';

function foo(promise = never()) {
  promise.then(val => {
    ...
  });
}

// or

function foo(promise = NEVER) {
  promise.then(val => {
    ...
  });
}
```

#### [Revert](https://open-source.telperion.tr/js-utils/modules/_promise_revert_.html)
Exchanges resolve state with rejection of a promise

```typescript
import { revert } from "@telperion/js-utils/promise";

const errorPromise = Promise.reject(new Error('foo'));

revert(errorPromise)
 .then(err => {
   console.log("this will be logged", err);
 })
 .catch(res => {
   console.log("this won't be logged", res);
 });
```

#### [Timeout](https://open-source.telperion.tr/js-utils/modules/_promise_timeout_.html)
Returns a promise which resolves after specified time

```typescript
import { timeout } from "@telperion/js-utils/promise";

timeout(1000)
 .then(() => console.log("will be logged after a second"));
```

#### [Try Catch](https://open-source.telperion.tr/js-utils/modules/_promise_try_catch_.html)
Merges result and error in the same callback

```typescript
import { tryCatch } from "@telperion/js-utils/promise";

const promise = anAsyncCall();

const [error, result] = await tryCatch(promise);
```

#### [Try One By One](https://open-source.telperion.tr/js-utils/modules/_promise_try_one_by_one_.html)
Tries a set of promises one by one with given order. Breaks the call when a promise resolved. Otherwise keeps trying incoming promises until the list is finished.

```typescript
import { tryOneByOne } from "@telperion/js-utils/promise";

async function fooFunction() {
  const foo = await tryOneByOne([
    () => someCall(),
    (err) => anotherCall(),
    (err) => fooPromise()
  ]);

  // do stuff
}
```

### String

#### [Limit](https://open-source.telperion.tr/js-utils/modules/_string_limit_.html)
Limits the string to `n` character

```typescript
import { limit } from "@telperion/js-utils/string";

const str = 'foobarbaz';

limit(str, 3); // 'foo'
```

### Time

Time utility functions for converting time units to milliseconds. These are particularly useful for setTimeout, setInterval, and Date operations.

#### [Seconds](https://open-source.telperion.tr/js-utils/modules/_time_seconds_.html)
Converts seconds to milliseconds

```typescript
import { seconds } from "@telperion/js-utils/time";

setTimeout(() => console.log('5 seconds later'), seconds(5));
```

#### [Minutes](https://open-source.telperion.tr/js-utils/modules/_time_minutes_.html)
Converts minutes to milliseconds

```typescript
import { minutes } from "@telperion/js-utils/time";

setTimeout(() => console.log('2 minutes later'), minutes(2));
```

#### [Hours](https://open-source.telperion.tr/js-utils/modules/_time_hours_.html)
Converts hours to milliseconds

```typescript
import { hours } from "@telperion/js-utils/time";

const sessionDuration = hours(2); // 7200000 ms
```

#### [Days](https://open-source.telperion.tr/js-utils/modules/_time_days_.html)
Converts days to milliseconds

```typescript
import { days } from "@telperion/js-utils/time";

const expiryDate = Date.now() + days(7); // 7 days from now
```

#### [Weeks](https://open-source.telperion.tr/js-utils/modules/_time_weeks_.html)
Converts weeks to milliseconds

```typescript
import { weeks } from "@telperion/js-utils/time";

const trialPeriod = weeks(2); // 2 weeks in milliseconds
```

#### [Months](https://open-source.telperion.tr/js-utils/modules/_time_months_.html)
Converts months to milliseconds (assumes 30 days per month)

```typescript
import { months } from "@telperion/js-utils/time";

const subscriptionPeriod = months(3); // ~3 months in milliseconds
```

#### [Years](https://open-source.telperion.tr/js-utils/modules/_time_years_.html)
Converts years to milliseconds (assumes 365 days per year)

```typescript
import { years } from "@telperion/js-utils/time";

const licenseExpiry = Date.now() + years(1); // ~1 year from now
```

### Etc.

#### [Arrayize](https://open-source.telperion.tr/js-utils/modules/_arrayize_.html)
Encapsulates a non array value with an array that contains it unless the value is already an array

```typescript
import { arrayize } from "@telperion/js-utils";

const foo = 'foo';
const bar = ['bar'];
const fooArr = arrayize(foo); // ['foo'];
const barArr = arrayize(bar); // ['bar'];
```

#### [Compact](https://open-source.telperion.tr/js-utils/modules/_compact_.html)
Filters falsy values of the given array
Removes `null` and `undefined` values and their keys from an object

```typescript
import { compact } from "@telperion/js-utils";

const arr = [undefined, "", false, 0, 1, "1"];
const compacted = compact(arr); // [1, "1"];

const object = {
 x: null,
 y: undefined,
 z: 20
};

const compacted = compact(object); // {z: 20}
```

#### [Is Falsy](https://open-source.telperion.tr/js-utils/modules/_is_falsy_.html)
Returns whether the entered value is falsy

```typescript
import { isFalsy } from "@telperion/js-utils";

isFalsy(undefined); // true
isFalsy(true); // false
```

#### [Is Truthy](https://open-source.telperion.tr/js-utils/modules/_is_truthy_.html)
Returns whether the entered value is truthy

```typescript
import { isTruthy } from "@telperion/js-utils";

isTruthy(undefined); // false
isTruthy(true); // true
```

#### [Limit](https://open-source.telperion.tr/js-utils/modules/_limit_.html)
Limits the string or array to `n` character

```typescript
import { limit } from "@telperion/js-utils";

const str = 'foobarbaz';
const array = ["a", "b", "c", "d", "e", "f"];

limit(str, 3); // 'foo'
limit(array, 3); // ["a", "b", "c"]
```

#### [Open Promise](https://open-source.telperion.tr/js-utils/modules/_open-promise_.html)
A promise constructor to resolve or reject from outside

```typescript
import { OpenPromise } from "@telperion/js-utils";

const aPromiseWillBeResolvedLater = new OpenPromise();

aPromiseWillBeResolvedLater.then(val => console.log(val));

aPromiseWillBeResolvedLater.resolve({x: 1});
// logs `{x: 1}`
```

#### [Smart Map](https://open-source.telperion.tr/js-utils/modules/_smart_map_.html)
Like WeakMap but can also store values using primitive keys

See: [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)

```typescript
import { SmartMap } from "@telperion/js-utils";

const aMap = new SmartMap();

aMap.set("foo", "foo");
aMap.set(1, "thales rocks");
console.log(aMap.size) // 2

aMap.set({}, "thales rocks again");
console.log(aMap.size) // 2

const anObject = {};
aMap.set(anObject, "thales rocks again and again");
console.log(aMap.size) // 3
console.log(aMap.get(anObject)) // "thales rocks again and again"
```

#### [Unique Id](https://open-source.telperion.tr/js-utils/modules/_unique-id_.html)
Starts a new counter for every unique prefix and if a prefix is given, returns the id by prefixing it, otherwise returns the id as number

```typescript
import { uniqueId } from "@telperion/js-utils";

uniqueId(); // 0
uniqueId(); // 1
uniqueId("some-str"); // "some-str-0";
uniqueId("some-str"); // "some-str-1";
uniqueId(); // 3
```

## Static/Prototype Methods

You may use any of these methods by adding them to the constructors or prototypes to native objects in main file.

Prototype Example:

```typescript
// main.ts
import "@telperion/js-utils/array/proto/compact";

// somewhere else
const arr = [undefined, "", false, 0, 1, "1", null];
const compacted = arr.compact(); // [1, "1"];

```

Static Example:

```typescript
// main.ts
import "@telperion/js-utils/promise/static/timeout";

// somewhere else
Promise.timeout(1000)
 .then(() => console.log("will be logged after a second"));
```

## License

[MIT](./LICENSE)
