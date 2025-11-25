# @thalesrc/paintlet

Pre-built CSS Paint API worklets for modern web development.

## Overview

`@thalesrc/paintlet` provides a collection of ready-to-use CSS Paint API (Houdini) worklets that enable powerful custom painting effects in CSS. These paintlets allow you to create complex visual effects that would be difficult or impossible with standard CSS.

## Features

- 🎨 Pre-built Paint API worklets
- 🚀 Easy to use and integrate
- 📦 Tree-shakeable ES modules
- 🔧 TypeScript support
- 📚 Comprehensive documentation with Storybook examples

## Installation

```bash
npm install @thalesrc/paintlet
```

or

```bash
pnpm add @thalesrc/paintlet
```

or

```bash
yarn add @thalesrc/paintlet
```

## Usage

### Installation & Import

Import the paintlet module to automatically register all worklets:

```typescript
import '@thalesrc/paintlet';
```

### Using in CSS

Apply the ripple effect using CSS Paint API:

```css
.ripple-effect {
  width: 300px;
  height: 300px;
  background-image: paint(tha-ripple);
  
  /* Customize with CSS custom properties */
  --tha-ripple-color: #3498db;
  --tha-ripple-density: 5;
  --tha-ripple-wave-width: 2;
}
```

### Available Paintlets

#### Ripple

Creates concentric circular waves radiating from the center.

**Custom Properties:**
- `--tha-ripple-color`: Color of the ripple waves (default: `#3498db`)
- `--tha-ripple-density`: Number of ripple waves (default: `5`)
- `--tha-ripple-wave-width`: Width of each wave line in pixels (default: `2`)

**Example:**

```css
.element {
  background-image: paint(ripple);
  --tha-ripple-color: #e74c3c;
  --tha-ripple-density: 10;
  --tha-ripple-wave-width: 3;
}
```

#### Rain

Creates an animated rain effect with customizable raindrops.

**Custom Properties:**
- `--tha-rain-color`: Color of the raindrops (default: `#4a90e2`)
- `--tha-rain-density`: Number of raindrops (default: `50`)
- `--tha-rain-speed`: Speed multiplier for rain animation (default: `5`)
- `--tha-rain-angle`: Angle of rain in degrees, 90 is vertical (default: `75`)
- `--tha-rain-min-length`: Minimum length of raindrops in pixels (default: `10`)
- `--tha-rain-max-length`: Maximum length of raindrops in pixels (default: `30`)
- `--tha-rain-min-thickness`: Minimum thickness of raindrops (default: `1`)
- `--tha-rain-max-thickness`: Maximum thickness of raindrops (default: `2`)
- `--tha-rain-frame`: Animation frame from 0 to 1000 (default: `0`)

**Animated Example:**

```css
.rain-effect {
  background-image: paint(tha-rain);
  animation: --tha-rain-animation(1s);
  --tha-rain-color: #4a90e2;
  --tha-rain-density: 50;
  --tha-rain-speed: 5;
  --tha-rain-angle: 75;
}
```

## Browser Support

CSS Paint API is supported in:
- Chrome/Edge 65+
- Opera 52+
- Safari 15.4+

For unsupported browsers, consider using a polyfill or providing fallback styles.

## Development

This library is part of the [Thalesrc](https://github.com/thalesrc/thalesrc) monorepo.

## License

MIT © [Thalesrc](https://github.com/thalesrc)
