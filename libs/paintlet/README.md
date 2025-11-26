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

Apply the ripple effect using the custom CSS function:

```css
.ripple-effect {
  width: 300px;
  height: 300px;
  background-image: --tha-ripple();
  
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
  background-image: --tha-ripple();
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
- `--tha-rain-angle`: Angle of rain in degrees, 90 is vertical (default: `75`)
- `--tha-rain-min-length`: Minimum length of raindrops in pixels (default: `10`)
- `--tha-rain-max-length`: Maximum length of raindrops in pixels (default: `30`)
- `--tha-rain-min-thickness`: Minimum thickness of raindrops (default: `1`)
- `--tha-rain-max-thickness`: Maximum thickness of raindrops (default: `2`)
- `--tha-rain-frame`: Animation frame from 0 to 1000 (default: `0`)

**Animated Example:**

```css
.rain-effect {
  background-image: --tha-rain();
  animation: --tha-rain-animation(1s);
  --tha-rain-color: #4a90e2;
  --tha-rain-density: 50;
  --tha-rain-angle: 75;
}
```

#### Mesh Gradient

Creates organic, flowing gradient meshes with multiple colors using a three-layer rendering approach: a conic gradient base, radial gradients at animated mesh points, and linear gradients connecting them.

**Custom Properties:**
- `--tha-mesh-gradient-complexity`: Number of mesh points (default: `5`, affects circle sizes inversely)
- `--tha-mesh-gradient-seed`: Random seed for mesh generation (default: `0`)
- `--tha-mesh-gradient-composite-points`: Blend mode for mesh points (default: `screen`)
- `--tha-mesh-gradient-composite-lines`: Blend mode for connecting lines (default: `lighter`)
- `--tha-mesh-gradient-frame`: Animation frame from 0 to 100 for circular motion (default: `0`)
- `--tha-mesh-gradient-color-1` through `--tha-mesh-gradient-color-10`: Individual color variables (default: `none`)

**Usage with Function Arguments:**

Pass colors as function arguments (up to 10 colors supported):

```css
.mesh-gradient {
  background-image: --tha-mesh-gradient(#667eea, #764ba2, #f093fb, #4facfe);
  --tha-mesh-gradient-complexity: 7;
  --tha-mesh-gradient-seed: 42;
}
```

**Usage with CSS Variables:**

Alternatively, use CSS custom properties for more flexibility:

```css
.mesh-gradient-vars {
  background-image: --tha-mesh-gradient();
  --tha-mesh-gradient-color-1: #667eea;
  --tha-mesh-gradient-color-2: #764ba2;
  --tha-mesh-gradient-color-3: #f093fb;
  --tha-mesh-gradient-color-4: #4facfe;
  --tha-mesh-gradient-complexity: 7;
  --tha-mesh-gradient-seed: 42;
}
```

**Animated Example:**

```css
.animated-mesh {
  background-image: --tha-mesh-gradient(#ff006e, #8338ec, #3a86ff, #06ffa5);
  animation: --tha-mesh-gradient-animation(10s);
  --tha-mesh-gradient-complexity: 8;
  --tha-mesh-gradient-seed: 15;
  --tha-mesh-gradient-composite-points: screen;
  --tha-mesh-gradient-composite-lines: lighter;
}
```

**Advanced Blend Modes:**

Experiment with different composite operations for unique effects:

```css
.custom-blend {
  background-image: --tha-mesh-gradient(#ffd3e1, #c8b6ff, #b8e0ff);
  --tha-mesh-gradient-composite-points: lighten;
  --tha-mesh-gradient-composite-lines: color-dodge;
}
```

**Animating Colors:**

Create dynamic color transitions by animating the color variables:

```css
.color-morphing {
  background-image: --tha-mesh-gradient();
  animation: color-shift 5s infinite alternate;
}

@keyframes color-shift {
  0% {
    --tha-mesh-gradient-color-1: #667eea;
    --tha-mesh-gradient-color-2: #764ba2;
    --tha-mesh-gradient-color-3: #f093fb;
  }
  100% {
    --tha-mesh-gradient-color-1: #ff006e;
    --tha-mesh-gradient-color-2: #8338ec;
    --tha-mesh-gradient-color-3: #3a86ff;
  }
}
```

**Combining Animations:**

Combine mesh point movement with color transitions for mesmerizing effects:

```css
.full-animation {
  background-image: --tha-mesh-gradient();
  animation: 
    --tha-mesh-gradient-animation(10s),
    color-pulse 8s infinite alternate;
  --tha-mesh-gradient-complexity: 8;
}

@keyframes color-pulse {
  0%, 100% {
    --tha-mesh-gradient-color-1: #667eea;
    --tha-mesh-gradient-color-2: #764ba2;
  }
  50% {
    --tha-mesh-gradient-color-1: #ff6b9d;
    --tha-mesh-gradient-color-2: #c44569;
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

This library is part of the [Thalesrc](https://github.com/thalesrc/thalesrc) monorepo.

## License

MIT © [Thalesrc](https://github.com/thalesrc)
