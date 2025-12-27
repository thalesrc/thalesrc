# @thalesrc/extra-ts-types

[![npm version](https://badge.fury.io/js/@thalesrc%2Fextra-ts-types.svg)](https://badge.fury.io/js/@thalesrc%2Fextra-ts-types)

Extra TypeScript utility types for advanced type manipulation and better type safety.

## Installation

```bash
npm install @thalesrc/extra-ts-types
```

```bash
yarn add @thalesrc/extra-ts-types
```

```bash
pnpm add @thalesrc/extra-ts-types
```

## Usage

```typescript
import { AnyFunction, PartialSome, Join, Tail } from '@thalesrc/extra-ts-types';

// For polyfills (like URLPattern)
import '@thalesrc/extra-ts-types/polyfills';
```

## API

### `AnyFunction`

A utility type that represents any function with any number of arguments and any return type.

```typescript
// Example usage
function callFunction(fn: AnyFunction) {
  return fn();
}

const myFunction = (a: number, b: string) => `${a}: ${b}`;
callFunction(myFunction); // Works with any function
```

### `ConstructorType<T>`

Extracts the constructor type from an interface or class type.

```typescript
// Example usage
class MyClass {
  constructor(public value: string) {}
}

type MyConstructor = ConstructorType<typeof MyClass>;
// MyConstructor is: new (value: string) => MyClass
```

### `DeepestValue<T, K>`

Gets the deepest type of a nested object by following a specific key path.

```typescript
// Example usage
type NestedObject = {
  data: {
    data: {
      data: string;
    };
  };
};

type Result = DeepestValue<NestedObject, 'data'>;
// Result is: string
```

### `DeepestObject<T, K>`

Gets the deepest object of a nested object by following a specific key path.

```typescript
// Example usage
type NestedObject = {
  data: {
    data: {
      value: string;
      other: number;
    };
  };
};

type Result = DeepestObject<NestedObject, 'data'>;
// Result is: { value: string; other: number; }
```

### `Join<T, Sep>`

Joins a union of strings with a separator, creating all possible combinations.

```typescript
// Example usage
type Colors = 'red' | 'blue' | 'green';
type ColorCombinations = Join<Colors, '-'>;
// Result includes: "red" | "blue" | "green" | "red-blue" | "red-green" | "blue-red" | "blue-green" | "green-red" | "green-blue" | ...

type SimpleJoin = Join<'x' | 'y'>;
// Result: "x" | "y" | "x,y" | "y,x"
```

### `PartialSome<T, K>`

Makes some properties of an object optional while keeping others required.

```typescript
// Example usage
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type UserWithOptionalContact = PartialSome<User, 'email' | 'age'>;
// Result: { id: number; name: string; email?: string; age?: number; }
```

### `Tail<X>`

Omits the first element of a tuple type, returning the rest.

```typescript
// Example usage
type Numbers = [1, 2, 3, 4, 5];
type RestNumbers = Tail<Numbers>;
// Result: [2, 3, 4, 5]

type Args = [string, number, boolean];
type RestArgs = Tail<Args>;
// Result: [number, boolean]
```

## Polyfills

### `URLPattern` (Global Type)

TypeScript type definitions for the URLPattern Web API, which provides pattern matching for URLs.

```typescript
// Import all polyfills
import '@thalesrc/extra-ts-types/polyfills';

// Or import URLPattern specifically
import '@thalesrc/extra-ts-types/polyfills/url-pattern';

// Now URLPattern is available in the global scope
const pattern = new URLPattern({ pathname: '/books/:id' });
const result = pattern.exec('https://example.com/books/123');
console.log(result?.pathname.groups.id); // '123'

// Test if a URL matches
if (pattern.test('https://example.com/books/456')) {
  console.log('URL matches!');
}
```

**Interfaces:**
- `URLPattern` - Main interface with `test()` and `exec()` methods
- `URLPatternInit` - Initialization options for creating patterns
- `URLPatternResult` - Match results including all URL components and captured groups
- `URLPatternComponentResult` - Matched text and groups for individual URL components

## Use Cases

- **Function Type Safety**: Use `AnyFunction` for generic function parameters
- **Constructor Patterns**: Extract constructor types with `ConstructorType`
- **Deep Object Navigation**: Work with nested structures using `DeepestValue` and `DeepestObject`
- **String Combinations**: Generate all possible string combinations with `Join`
- **Flexible Interfaces**: Create partially optional interfaces with `PartialSome`
- **Tuple Manipulation**: Work with tuple types using `Tail`
- **URL Pattern Matching**: Use `URLPattern` polyfill types for type-safe URL routing and matching

## Contributing

This package is part of the [Thalesrc](https://github.com/thalesrc) monorepo. Contributions are welcome!

## License

MIT © [Thalesrc](https://github.com/thalesrc)

## Homepage

Visit [extra-ts-types.thalesrc.com](https://extra-ts-types.thalesrc.com) for more information and examples.
