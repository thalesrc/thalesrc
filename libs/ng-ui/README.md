# @telperion/ng-ui

Angular UI element library organized as ng-packagr secondary entry points.

## Installation

```bash
pnpm add @telperion/ng-ui
```

## Entry points

| Subpath                         | Exports                                  |
| ------------------------------- | ---------------------------------------- |
| `@telperion/ng-ui`              | Library version constant                 |
| `@telperion/ng-ui/form`         | (placeholder for future form-level APIs) |
| `@telperion/ng-ui/form/field`   | `FieldComponent`, `FieldModule`          |

## Usage

```ts
import { NgModule } from '@angular/core';
import { FieldModule } from '@telperion/ng-ui/form/field';

@NgModule({
  imports: [FieldModule],
})
export class AppModule {}
```

```html
<tui-field>...</tui-field>
```

`FieldComponent` is **not** standalone and must be used through `FieldModule`.

## Tailwind v4

Components ship pre-compiled with utility classes baked into their templates as
plain strings. To make those utilities visible in your app, your application
must run Tailwind v4 and tell it to scan this package:

```css
/* your-app/styles.css */
@import "tailwindcss";
@source "../node_modules/@telperion/ng-ui/**/*.{mjs,js}";
```

## Development

```bash
pnpm nx run ng-ui:storybook        # http://localhost:6008
pnpm nx run ng-ui:build
pnpm nx run ng-ui:build-storybook
pnpm nx run ng-ui:lint
```

See also: [./form/README.md](./form/README.md), [./form/field/README.md](./form/field/README.md).
