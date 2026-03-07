# @telperion/ng-pack/storage-signals

Angular signals-based wrapper for browser's localStorage, sessionStorage, and cookies with reactive updates.

## Features

- 🚀 **Signal-based API** - Seamlessly integrate with Angular's signal system
- 🔄 **Reactive updates** - Automatically sync changes across components
- 🎯 **Type-safe** - Full TypeScript support with generic typing
- 🏪 **Triple storage support** - Works with localStorage, sessionStorage, and cookies
- 🔑 **Namespaced storage** - Organize storage with app names and store names
- 🎯 **Nested property access** - Access deep object properties using dot notation
- 🧹 **Simple API** - Signal interface with `set()`, `update()`, and `delete()` methods
- 🍪 **Cookie configuration** - Full control over cookie options (secure, sameSite, maxAge, etc.)
- 🔗 **Cross-instance sync** - Cookie signals support instance synchronization

## Installation

This is a secondary entry point of `@telperion/ng-pack`. Import from `@telperion/ng-pack/storage-signals`.

```bash
npm install @telperion/ng-pack
```

## Setup

### Local Storage

Configure localStorage in your application config:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideLocalStorage } from '@telperion/ng-pack/storage-signals';

export const appConfig: ApplicationConfig = {
  providers: [
    provideLocalStorage('my-app'), // Optional app name for namespacing
    // ... other providers
  ]
};
```

### Session Storage

Configure sessionStorage in your application config:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideSessionStorage } from '@telperion/ng-pack/storage-signals';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSessionStorage('my-app'), // Optional app name for namespacing
    // ... other providers
  ]
};
```

### Cookie Storage

Configure cookie storage in your application config:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideCookieStorage } from '@telperion/ng-pack/storage-signals';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCookieStorage('my-app', {
      path: '/',
      secure: true,
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    }),
    // ... other providers
  ]
};
```

**Cookie Options:**
- `path` - Cookie path (default: current path)
- `domain` - Cookie domain (default: current domain)
- `secure` - Require HTTPS (recommended for production)
- `sameSite` - CSRF protection: `'strict'` | `'lax'` | `'none'`
- `maxAge` - Expiry time in seconds
- `expires` - Expiry as Date object

## Usage

### Basic Usage

```typescript
import { Component } from '@angular/core';
import { localStorageSignal } from '@telperion/ng-pack/storage-signals';

@Component({
  selector: 'app-user-settings',
  template: `
    <div>
      <p>Theme: {{ theme() }}</p>
      <button (click)="toggleTheme()">Toggle Theme</button>
      <button (click)="resetTheme()">Reset</button>
    </div>
  `
})
export class UserSettingsComponent {
  // Create a signal connected to localStorage
  theme = localStorageSignal<string>('settings', 'theme');

  toggleTheme() {
    this.theme.update(current => current === 'dark' ? 'light' : 'dark');
  }

  resetTheme() {
    this.theme.delete();
  }
}
```

### Session Storage

```typescript
import { Component } from '@angular/core';
import { sessionStorageSignal } from '@telperion/ng-pack/storage-signals';

@Component({
  selector: 'app-wizard',
  template: `
    <div>
      <p>Current Step: {{ currentStep() }}</p>
      <button (click)="nextStep()">Next</button>
    </div>
  `
})
export class WizardComponent {
  currentStep = sessionStorageSignal<number>('wizard', 'currentStep');

  nextStep() {
    this.currentStep.update(step => (step ?? 0) + 1);
  }
}
```

### Cookie Storage

```typescript
import { Component } from '@angular/core';
import { cookieStorageSignal } from '@telperion/ng-pack/storage-signals';

@Component({
  selector: 'app-auth',
  template: `
    <div>
      @if (authToken()) {
        <p>Authenticated</p>
        <button (click)="logout()">Logout</button>
      } @else {
        <button (click)="login()">Login</button>
      }
    </div>
  `
})
export class AuthComponent {
  // Create a signal connected to cookies with custom options
  authToken = cookieStorageSignal<string>('auth', 'token', {
    secure: true,
    sameSite: 'strict',
    maxAge: 3600 // 1 hour
  });

  login() {
    this.authToken.set('abc123token');
  }

  logout() {
    this.authToken.delete();
  }
}
```

**Important:** Cookies have a ~4KB size limit. The library enforces a 4000-byte limit and throws an error if exceeded. Use localStorage for larger data.

### Nested Property Access

One of the most powerful features is the ability to access nested object properties using dot notation:

```typescript
@Component({
  selector: 'app-preferences',
  template: `
    <div>
      <p>Theme: {{ theme() }}</p>
      <p>Language: {{ language() }}</p>
      <p>Notifications: {{ notifications() }}</p>
      <button (click)="updateLanguage('es')">Spanish</button>
      <button (click)="toggleNotifications()">Toggle Notifications</button>
    </div>
  `
})
export class PreferencesComponent {
  // Access nested properties directly with dot notation
  theme = localStorageSignal<string>('user', 'preferences.theme');
  language = localStorageSignal<string>('user', 'preferences.language');
  notifications = localStorageSignal<boolean>('user', 'preferences.notifications');

  ngOnInit() {
    // Initialize with default values if not set
    if (!this.theme()) this.theme.set('light');
    if (!this.language()) this.language.set('en');
    if (this.notifications() === undefined) this.notifications.set(true);
  }

  updateLanguage(language: string) {
    this.language.set(language);
  }

  toggleNotifications() {
    this.notifications.update(enabled => !enabled);
  }
}
```

This approach provides several benefits:
- Each property has its own reactive signal
- No need for optional chaining or null checks in templates
- Updates to one property don't trigger re-renders for components using other properties
- More granular control and better performance

### Cross-Component Synchronization

Changes to storage signals are automatically synchronized across all components:

```typescript
// Component A
@Component({
  selector: 'app-sidebar',
  template: `<p>Count: {{ count() }}</p>`
})
export class SidebarComponent {
  count = localStorageSignal<number>('app', 'count');
}

// Component B
@Component({
  selector: 'app-header',
  template: `
    <button (click)="increment()">
      Count: {{ count() }}
    </button>
  `
})
export class HeaderComponent {
  count = localStorageSignal<number>('app', 'count');

  increment() {
    this.count.update(n => (n ?? 0) + 1);
  }
}
// Both components will show the same value and update together!
```

## API Reference

### `provideLocalStorage(appName?: string): Provider`

Creates a provider for localStorage integration.

**Parameters:**
- `appName` (optional) - Namespace prefix for all storage keys

**Returns:** Angular Provider

---

### `provideSessionStorage(appName?: string): Provider`

Creates a provider for sessionStorage integration.

**Parameters:**
- `appName` (optional) - Namespace prefix for all storage keys

**Returns:** Angular Provider

---

### `localStorageSignal<T>(store: string, key: string): StorageSignal<T>`

Creates a signal connected to localStorage. Must be called within an injection context.

**Parameters:**
- `store` - Storage namespace/category (e.g., 'settings', 'user')
- `key` - Unique key within the store

**Returns:** `StorageSignal<T>`

---

### `sessionStorageSignal<T>(store: string, key: string): StorageSignal<T>`

Creates a signal connected to sessionStorage. Must be called within an injection context.

**Parameters:**
- `store` - Storage namespace/category (e.g., 'wizard', 'form-data')
- `key` - Unique key within the store

**Returns:** `StorageSignal<T>`

---

### `provideCookieStorage(appName?: string, options?: ReactiveCookieStorageOptions): Provider`

Creates a provider for cookie storage integration.

**Parameters:**
- `appName` (optional) - Namespace prefix for all cookie names
- `options` (optional) - Default cookie options applied to all signals
  - `path` - Cookie path
  - `domain` - Cookie domain
  - `secure` - Require HTTPS
  - `sameSite` - CSRF protection (`'strict'` | `'lax'` | `'none'`)
  - `maxAge` - Expiry time in seconds
  - `expires` - Expiry as Date object

**Returns:** Angular Provider

---

### `cookieStorageSignal<T>(store: string, key: string, options?: ReactiveCookieStorageOptions): StorageSignal<T>`

Creates a signal connected to browser cookies. Must be called within an injection context.

**Parameters:**
- `store` - Storage namespace/category (e.g., 'auth', 'preferences')
- `key` - Unique key within the store
- `options` (optional) - Cookie-specific options that override provider defaults

**Returns:** `StorageSignal<T>`

**Limitations:**
- Maximum ~4KB per cookie (enforced at 4000 bytes)
- Throws error if value exceeds size limit

**Security Best Practices:**
- Use `secure: true` in production (HTTPS only)
- Use `sameSite: 'strict'` for CSRF protection
- Set appropriate `maxAge` for sensitive data
- Never store unencrypted sensitive data

---

### `StorageSignal<T>`

A signal interface extending Angular's `WritableSignal` with additional storage methods.

**Methods:**
- `()` - Read the current value
- `set(value: T | null | undefined)` - Set a new value
- `update(fn: (value: T | null | undefined) => T | null | undefined)` - Update using a function
- `delete()` - Remove the value from storage

## Storage Organization

The library uses a hierarchical storage structure for all storage types:

```
[appName]:[store]:[key] = value
```

Example:
```typescript
// With provideLocalStorage('my-app')
localStorageSignal<string>('settings', 'theme');
// Creates localStorage key: "my-app:settings:theme"

// With provideSessionStorage('my-app')
sessionStorageSignal<number>('user', 'id');
// Creates sessionStorage key: "my-app:user:id"

// With provideCookieStorage('my-app')
cookieStorageSignal<string>('auth', 'token');
// Creates cookie name: "my-app:auth:token"
```

This organization helps prevent key collisions and makes storage management cleaner.

## Storage Type Comparison

| Feature | localStorage | sessionStorage | Cookies |
|---------|--------------|----------------|---------|
| **Persistence** | Until explicitly cleared | Until tab/window closes | Until expiry (configurable) |
| **Capacity** | ~10MB | ~10MB | ~4KB per cookie |
| **Scope** | All tabs/windows | Single tab/window | All tabs/windows |
| **Server Access** | No | No | Yes (sent with requests) |
| **Best For** | Long-term app state | Per-session state | Auth tokens, small settings |
| **Security** | Client-side only | Client-side only | HttpOnly, Secure, SameSite options |

**When to use:**
- **localStorage**: User preferences, app settings, cached data
- **sessionStorage**: Multi-step forms, temporary UI state, wizard flows
- **cookies**: Authentication tokens, session IDs, small persistent preferences

## TypeScript Support

The library is fully typed with TypeScript generics:

```typescript
// Type-safe signals
const theme = localStorageSignal<'light' | 'dark'>('settings', 'theme');
theme.set('light'); // ✓ OK
theme.set('blue');  // ✗ Type error

const count = localStorageSignal<number>('app', 'count');
count.set(42);      // ✓ OK
count.set('42');    // ✗ Type error

// Complex types
interface User {
  id: number;
  name: string;
}

const user = localStorageSignal<User>('auth', 'currentUser');
user.set({ id: 1, name: 'Alice' }); // ✓ OK
```

## Best Practices

1. **Use dot notation for nested properties** - Access deep object properties directly
   ```typescript
   // Instead of managing the whole object
   const user = localStorageSignal<User>('app', 'user');
   const name = user()?.profile?.name;
   
   // Access nested properties directly
   const userName = localStorageSignal<string>('app', 'user.profile.name');
   const userEmail = localStorageSignal<string>('app', 'user.profile.email');
   ```

2. **Use meaningful store names** - Group related keys together
   ```typescript
   localStorageSignal('user-preferences', 'theme');
   localStorageSignal('user-preferences', 'language');
   ```

3. **Initialize with defaults** - Check for null/undefined initial values
   ```typescript
   const theme = localStorageSignal<string>('settings', 'theme');
   if (!theme()) {
     theme.set('light');
   }
   ```

4. **Clean up sensitive data** - Use `delete()` when appropriate
   ```typescript
   onLogout() {
     this.authToken.delete();
   }
   ```

5. **Use sessionStorage for temporary data** - Forms, wizards, temporary state
   ```typescript
   const formDraft = sessionStorageSignal('form', 'draft');
   ```

6. **Use cookies for security-sensitive small data** - Auth tokens with proper options
   ```typescript
   const authToken = cookieStorageSignal<string>('auth', 'token', {
     secure: true,      // HTTPS only
     sameSite: 'strict', // CSRF protection
     maxAge: 3600       // 1 hour expiry
   });
   ```

7. **Mind the cookie size limit** - Keep cookie data under 4KB
   ```typescript
   // Good: Small auth token
   cookieStorageSignal<string>('auth', 'token');
   
   // Bad: Large data (use localStorage instead)
   // cookieStorageSignal<LargeObject>('data', 'large');
   ```

8. **Override cookie options per signal** - Different cookies need different lifetimes
   ```typescript
   // Long-lived preference
   const theme = cookieStorageSignal<string>('prefs', 'theme', {
     maxAge: 31536000 // 1 year
   });
   
   // Short-lived session token
   const token = cookieStorageSignal<string>('auth', 'token', {
     maxAge: 3600 // 1 hour
   });
   ```

## License

This library is part of the Telperion monorepo.
