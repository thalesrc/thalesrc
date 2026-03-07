# @telperion/reactive-storage

[![npm version](https://badge.fury.io/js/%40telperion%2Freactive-storage.svg)](https://badge.fury.io/js/%40telperion%2Freactive-storage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Reactive RxJS-based wrapper for browser storage APIs (localStorage and sessionStorage). Provides an Observable-based API for real-time storage updates with support for nested property access and automatic synchronization.

## Features

- 🔄 **Reactive API**: Built on RxJS Observables for automatic change detection
- 📦 **Type-Safe**: Full TypeScript support with generics
- 🎯 **Nested Access**: Support for dot notation to access deep object properties
- 🔒 **Immutable**: Deep-frozen data guarantees immutability
- ⚡ **FIFO Queue**: Ordered write operations prevent race conditions
- 🌲 **Tree-Shakeable**: Import only what you need
- 🎨 **Framework Agnostic**: Works with any framework or vanilla JS

## Installation

```bash
npm install @telperion/reactive-storage
```

```bash
yarn add @telperion/reactive-storage
```

```bash
pnpm add @telperion/reactive-storage
```

## Quick Start

```typescript
import { ReactiveWebLocalStorage } from '@telperion/reactive-storage';

// Create storage instance
const storage = new ReactiveWebLocalStorage('my-app');

// Subscribe to changes
storage.get('user', 'profile.name').subscribe(name => {
  console.log('User name:', name);
});

// Update storage
await storage.set('user', 'profile.name', 'John Doe');
// Console logs: "User name: John Doe"
```

## API

### Classes

#### `ReactiveWebLocalStorage<S extends string>`

Reactive wrapper for `localStorage`. Data persists across browser sessions.

```typescript
const storage = new ReactiveWebLocalStorage(appName?: string);
```

**Parameters:**
- `appName` (optional): Application namespace (default: `'app'`). Used to prefix storage keys.

#### `ReactiveWebSessionStorage<S extends string>`

Reactive wrapper for `sessionStorage`. Data is cleared when the browser tab is closed.

```typescript
const storage = new ReactiveWebSessionStorage(appName?: string);
```

**Parameters:**
- `appName` (optional): Application namespace (default: `'app'`)

#### `ReactiveWebStorage<S extends string>`

Generic reactive storage wrapper. Allows using any `Storage` implementation.

```typescript
const storage = new ReactiveWebStorage(
  storage: Storage,
  appName?: string
);
```

### Methods

All methods are available on storage instances:

#### `get<T>(storeName: string, key?: string): Observable<T>`

Get an Observable that emits the current value and all future updates.

**Parameters:**
- `storeName`: Name of the storage store
- `key` (optional): Property path using dot notation (e.g., `'user.settings.theme'`). Empty string or omit for entire store.

**Returns:** `Observable<T>` that emits on value changes

**Example:**
```typescript
// Get entire store
storage.get('user').subscribe(user => console.log(user));

// Get nested property
storage.get('user', 'profile.email').subscribe(email => console.log(email));

// Typed return
storage.get<string>('user', 'profile.name').subscribe(name => {
  // name is typed as string
});
```

#### `set(storeName: string, key: string, value: any): Promise<void>`

Set a value in storage. Overwrites existing value. Pass `undefined` to remove.

**Example:**
```typescript
// Set entire store
await storage.set('user', '', { name: 'John', age: 30 });

// Set nested property
await storage.set('user', 'profile.name', 'John Doe');

// Remove a value
await storage.set('user', 'profile.name', undefined);
```

#### `patch(storeName: string, key: string, value: any): Promise<void>`

Merge a partial object into existing value. Only works with objects.

**Example:**
```typescript
await storage.set('user', '', { name: 'John', age: 30 });

// Merge partial data
await storage.patch('user', '', { age: 31, email: 'john@example.com' });
// Result: { name: 'John', age: 31, email: 'john@example.com' }
```

#### `delete(storeName: string, key?: string): Promise<void>`

Delete a value from storage.

**Example:**
```typescript
// Delete a nested property
await storage.delete('user', 'profile.email');

// Delete entire store
await storage.delete('user');
```

#### `push(storeName: string, key: string, ...values: any[]): Promise<void>`

Add items to an array in storage.

**Example:**
```typescript
await storage.set('todos', 'items', ['Task 1']);

await storage.push('todos', 'items', 'Task 2', 'Task 3');
// Result: ['Task 1', 'Task 2', 'Task 3']
```

#### `drop(storeName: string, key: string, value: any): Promise<void>`

Remove a specific value from an array in storage.

**Example:**
```typescript
await storage.set('todos', 'items', ['Task 1', 'Task 2', 'Task 3']);

await storage.drop('todos', 'items', 'Task 2');
// Result: ['Task 1', 'Task 3']
```

## Usage Examples

### Basic Usage

```typescript
import { ReactiveWebLocalStorage } from '@telperion/reactive-storage';

const storage = new ReactiveWebLocalStorage('my-app');

// Subscribe to changes
const subscription = storage.get('settings', 'theme').subscribe(theme => {
  document.body.setAttribute('data-theme', theme || 'light');
});

// Update value
await storage.set('settings', 'theme', 'dark');

// Clean up
subscription.unsubscribe();
```

### Working with Nested Objects

```typescript
// Initialize user data
await storage.set('user', '', {
  profile: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  preferences: {
    notifications: true,
    language: 'en'
  }
});

// Subscribe to nested property
storage.get('user', 'preferences.notifications').subscribe(enabled => {
  console.log('Notifications:', enabled);
});

// Update nested property
await storage.set('user', 'preferences.language', 'es');
```

### Working with Arrays

```typescript
// Initialize array
await storage.set('todos', 'items', []);

// Add items
await storage.push('todos', 'items', 
  { id: 1, text: 'Buy milk', done: false },
  { id: 2, text: 'Walk dog', done: false }
);

// Subscribe to changes
storage.get('todos', 'items').subscribe(todos => {
  console.log('Total todos:', todos.length);
});

// Remove item
const itemToRemove = { id: 1, text: 'Buy milk', done: false };
await storage.drop('todos', 'items', itemToRemove);
```

### Type Safety

```typescript
interface User {
  name: string;
  email: string;
  age: number;
}

type StoreName = 'user' | 'settings' | 'todos';

const storage = new ReactiveWebLocalStorage<StoreName>('my-app');

// TypeScript will enforce valid store names
storage.get<User>('user').subscribe(user => {
  // user is typed as User
  console.log(user.name.toUpperCase());
});

// This would cause a TypeScript error:
// storage.get('invalid-store'); ❌
```

### Integration with Framework-Specific Wrappers

This library serves as the foundation for framework-specific integrations:

- **Angular**: See [@telperion/ng-pack](https://www.npmjs.com/package/@telperion/ng-pack) for Signal-based storage
- **React**: See [@telperion/react-utils](https://www.npmjs.com/package/@telperion/react-utils) for hooks-based storage

## How It Works

1. **Storage Namespacing**: Data is stored with app-prefixed keys (e.g., `my-app/user`)
2. **JSON Serialization**: All data is serialized to JSON for storage compatibility
3. **Change Tracking**: Internal Subject emits changes that update all subscribers
4. **FIFO Queue**: Write operations are queued using `@FifoPromise` decorator to prevent race conditions
5. **Immutability**: All emitted values are deep-frozen to prevent accidental mutations

## Browser Compatibility

Works in all modern browsers that support:
- Web Storage API (localStorage/sessionStorage)
- ES2015+ features
- RxJS 7+

## Building

```bash
pnpm nx run reactive-storage:build
```

## Testing

```bash
pnpm nx run reactive-storage:test
```

## License

MIT © Telperion Technology
