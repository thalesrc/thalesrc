# @telperion/ng-pack

A collection of Angular utilities and libraries

## Installation

```bash
npm install @telperion/ng-pack
```

## Available Modules

### Storage Signals

**Import:** `@telperion/ng-pack/storage-signals`

Angular signals-based wrapper for browser's localStorage and sessionStorage with reactive updates.

#### Key Features

- 🚀 Signal-based API integrated with Angular's signal system
- 🔄 Reactive updates automatically synced across components
- 🎯 Nested property access using dot notation
- 🏪 Support for both localStorage and sessionStorage
- 🔑 Namespaced storage organization

#### Quick Start

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideLocalStorage } from '@telperion/ng-pack/storage-signals';

export const appConfig: ApplicationConfig = {
  providers: [
    provideLocalStorage('my-app'),
  ]
};
```

```typescript
import { Component } from '@angular/core';
import { localStorageSignal } from '@telperion/ng-pack/storage-signals';

@Component({
  selector: 'app-settings',
  template: `
    <div>
      <p>Theme: {{ theme() }}</p>
      <button (click)="theme.set('dark')">Dark Mode</button>
    </div>
  `
})
export class SettingsComponent {
  // Access nested properties with dot notation
  theme = localStorageSignal<string>('settings', 'ui.theme');
}
```

[Full documentation →](./storage-signals/README.md)

---

### Template Signal Forms

**Import:** `@telperion/ng-pack/template-signal-forms`

🚧 **Under Construction**

Signal-based forms utilities for Angular template-driven forms.

---

### Utils

**Import:** `@telperion/ng-pack/utils`

🚧 **Under Construction**

Common Angular utilities and helpers.

---

## Development

### Running Unit Tests

Run `pnpm nx test ng-pack` to execute the unit tests.

### Building

Run `pnpm nx build ng-pack` to build the library.

## License

This library is part of the Telperion monorepo.
