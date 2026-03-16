# @telperion/paintlet

Pre-built CSS Paint API worklets for modern web development.

## Overview

`@telperion/paintlet` provides a collection of ready-to-use CSS Paint API (Houdini) worklets that enable powerful custom painting effects in CSS. These paintlets allow you to create complex visual effects that would be difficult or impossible with standard CSS.

## Features

- 🎨 Pre-built Paint API worklets
- 🚀 Easy to use and integrate
- 📦 Tree-shakeable ES modules
- 🔧 TypeScript support
- 📚 Comprehensive documentation with Storybook examples

## Installation

```bash
npm install @telperion/paintlet
```

or

```bash
pnpm add @telperion/paintlet
```

or

```bash
yarn add @telperion/paintlet
```

## Usage

### Installation & Import

Import the paintlet module to automatically register all worklets:

```typescript
import '@telperion/paintlet';
```

### Using in CSS

Apply the ripple effect using the custom CSS function:

```css
.ripple-effect {
  width: 300px;
  height: 300px;
  background-image: --tp-ripple();
  
  /* Customize with CSS custom properties */
  --tp-ripple-color: #3498db;
  --tp-ripple-density: 5;
  --tp-ripple-wave-width: 2;
}
```

### Available Paintlets

#### Ripple

Creates concentric circular waves radiating from the center.

**Custom Properties:**
- `--tp-ripple-color`: Color of the ripple waves (default: `#3498db`)
- `--tp-ripple-density`: Number of ripple waves (default: `5`)
- `--tp-ripple-wave-width`: Width of each wave line in pixels (default: `2`)

**Example:**

```css
.element {
  background-image: --tp-ripple();
  --tp-ripple-color: #e74c3c;
  --tp-ripple-density: 10;
  --tp-ripple-wave-width: 3;
}
```

#### Rain

Creates an animated rain effect with customizable raindrops.

**Custom Properties:**
- `--tp-rain-color`: Color of the raindrops (default: `#4a90e2`)
- `--tp-rain-density`: Number of raindrops (default: `50`)
- `--tp-rain-angle`: Angle of rain in degrees, 90 is vertical (default: `75`)
- `--tp-rain-min-length`: Minimum length of raindrops in pixels (default: `10`)
- `--tp-rain-max-length`: Maximum length of raindrops in pixels (default: `30`)
- `--tp-rain-min-thickness`: Minimum thickness of raindrops (default: `1`)
- `--tp-rain-max-thickness`: Maximum thickness of raindrops (default: `2`)
- `--tp-rain-frame`: Animation frame from 0 to 1000 (default: `0`)

**Animated Example:**

```css
.rain-effect {
  background-image: --tp-rain();
  animation: --tp-rain-animation(1s);
  --tp-rain-color: #4a90e2;
  --tp-rain-density: 50;
  --tp-rain-angle: 75;
}
```

#### PAL Gradient (Points And Lines)

Creates organic, flowing gradients with multiple colors using a three-layer rendering approach: a conic gradient base, radial gradients at animated points, and linear gradients connecting them.

**Custom Properties:**
- `--tp-pal-gradient-complexity`: Number of points (default: `5`, affects circle sizes inversely)
- `--tp-pal-gradient-seed`: Random seed for generation (default: `0`)
- `--tp-pal-gradient-composite-points`: Blend mode for points (default: `screen`)
- `--tp-pal-gradient-composite-lines`: Blend mode for connecting lines (default: `lighter`)
- `--tp-pal-gradient-frame`: Animation frame from 0 to 100 for circular motion (default: `0`)
- `--tp-pal-gradient-color-1` through `--tp-pal-gradient-color-10`: Individual color variables (default: `none`)

**Usage with Function Arguments:**

Pass colors as function arguments (up to 10 colors supported):

```css
.pal-gradient {
  background-image: --tp-pal-gradient(#667eea, #764ba2, #f093fb, #4facfe);
  --tp-pal-gradient-complexity: 7;
  --tp-pal-gradient-seed: 42;
}
```

**Usage with CSS Variables:**

Alternatively, use CSS custom properties for more flexibility:

```css
.pal-gradient-vars {
  background-image: --tp-pal-gradient();
  --tp-pal-gradient-color-1: #667eea;
  --tp-pal-gradient-color-2: #764ba2;
  --tp-pal-gradient-color-3: #f093fb;
  --tp-pal-gradient-color-4: #4facfe;
  --tp-pal-gradient-complexity: 7;
  --tp-pal-gradient-seed: 42;
}
```

**Animated Example:**

```css
.animated-pal {
  background-image: --tp-pal-gradient(#ff006e, #8338ec, #3a86ff, #06ffa5);
  animation: --tp-pal-gradient-animation(10s);
  --tp-pal-gradient-complexity: 8;
  --tp-pal-gradient-seed: 15;
  --tp-pal-gradient-composite-points: screen;
  --tp-pal-gradient-composite-lines: lighter;
}
```

**Advanced Blend Modes:**

Experiment with different composite operations for unique effects:

```css
.custom-blend {
  background-image: --tp-pal-gradient(#ffd3e1, #c8b6ff, #b8e0ff);
  --tp-pal-gradient-composite-points: lighten;
  --tp-pal-gradient-composite-lines: color-dodge;
}
```

**Animating Colors:**

Create dynamic color transitions by animating the color variables:

```css
.color-morphing {
  background-image: --tp-pal-gradient();
  animation: color-shift 5s infinite alternate;
}

@keyframes color-shift {
  0% {
    --tp-pal-gradient-color-1: #667eea;
    --tp-pal-gradient-color-2: #764ba2;
    --tp-pal-gradient-color-3: #f093fb;
  }
  100% {
    --tp-pal-gradient-color-1: #ff006e;
    --tp-pal-gradient-color-2: #8338ec;
    --tp-pal-gradient-color-3: #3a86ff;
  }
}
```

**Combining Animations:**

Combine point movement with color transitions for mesmerizing effects:

```css
.full-animation {
  background-image: --tp-pal-gradient();
  animation: 
    --tp-pal-gradient-animation(10s),
    color-pulse 8s infinite alternate;
  --tp-pal-gradient-complexity: 8;
}

@keyframes color-pulse {
  0%, 100% {
    --tp-pal-gradient-color-1: #667eea;
    --tp-pal-gradient-color-2: #764ba2;
  }
  50% {
    --tp-pal-gradient-color-1: #ff6b9d;
    --tp-pal-gradient-color-2: #c44569;
  }
}
```

## Browser Support

CSS Paint API is supported in:
- Chrome/Edge 65+
- Opera 52+
- Safari 15.4+

For unsupported browsers, consider using a polyfill or providing fallback styles.

## Development

This library is part of the [Telperion](https://github.com/telperiontech/telperion) monorepo.

## License

MIT Â© [Telperion](https://github.com/telperiontech)
