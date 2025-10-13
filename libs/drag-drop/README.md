# @thalesrc/drag-drop

[![npm version](https://badge.fury.io/js/@thalesrc%2Fdrag-drop.svg)](https://badge.fury.io/js/@thalesrc%2Fdrag-drop)
[![npm](https://img.shields.io/npm/dm/@thalesrc/drag-drop.svg)](https://www.npmjs.com/package/@thalesrc/drag-drop)
[![Drag Drop Publish](https://github.com/thalesrc/thalesrc/actions/workflows/drag-drop.publish.yml/badge.svg)](https://github.com/thalesrc/thalesrc/actions/workflows/drag-drop.publish.yml)

A framework-independent drag-and-drop library built with [Lit Elements](https://lit.dev/) as custom web components. This library provides extended forms of native DOM drag-drop events with enhanced functionality for modern web applications.

## ✨ Features

- 🌐 **Framework Independent**: Built as custom web elements, works with any framework (React, Vue, Angular, Vanilla JS)
- 🔧 **Extended Events**: Enhanced drag-drop events beyond native DOM events
- 🎯 **Drop Zones**: Smart drop zone detection and validation
- 🖱️ **Drag Handles**: Support for specific drag handles within draggable elements
- 📦 **Drag Strategies**: Multiple dragging strategies (move, copyMove)
- 🎨 **CSS Custom Properties**: Rich CSS variable support for styling
- 🔄 **Clone Support**: Optional element cloning during drag operations
- 📊 **Data Transfer**: Custom data attribute support for drag operations

## 📦 Installation

```bash
npm install @thalesrc/drag-drop
```

```bash
yarn add @thalesrc/drag-drop
```

```bash
pnpm add @thalesrc/drag-drop
```

## 🚀 Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="node_modules/@thalesrc/drag-drop/index.js"></script>
</head>
<body>
  <!-- Simple draggable element -->
  <tha-drag>
    <div>Drag me!</div>
  </tha-drag>

  <!-- Drop zone -->
  <tha-dropzone accept="my-item">
    <div>Drop here!</div>
  </tha-dropzone>
</body>
</html>
```

### With Framework (React Example)

```jsx
import '@thalesrc/drag-drop';

function MyComponent() {
  return (
    <div>
      <tha-drag name="my-item" draggingStrategy="move" replaceClone>
        <div>Draggable Item</div>
      </tha-drag>
      
      <tha-dropzone accept="my-item">
        <div>Drop Zone</div>
      </tha-dropzone>
    </div>
  );
}
```

## 🎯 Components

### `<tha-drag>`

The main draggable element component.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `string` | `""` | Identifier for the draggable element |
| `draggingStrategy` | `"move" \| "copyMove"` | `"move"` | Drag behavior strategy |
| `replaceClone` | `boolean` | `false` | Whether to replace element with clone during drag |
| `dragGroup` | `string` | `""` | Group name for drag operations (future feature) |

#### Attributes

- `data-drag-*`: Custom data attributes for transferring data during drag operations

#### Example

```html
<tha-drag 
  name="item-1" 
  draggingStrategy="copyMove" 
  replaceClone
  data-drag-id="123"
  data-drag-category="widgets">
  <div>My Draggable Item</div>
</tha-drag>
```

### `<tha-dropzone>`

Container element that accepts dropped items.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `string` | `""` | Identifier for the drop zone |
| `accept` | `string[]` | `[]` | Array of acceptable drag element names |

#### Example

```html
<tha-dropzone accept="item-1,item-2" name="zone-1">
  <div>Drop items here</div>
</tha-dropzone>
```

### `<tha-drag-handle>`

Defines specific areas within a draggable element that can initiate drag operations.

#### Example

```html
<tha-drag name="card">
  <div class="card">
    <tha-drag-handle>
      <div class="drag-handle">⋮⋮</div>
    </tha-drag-handle>
    <div class="card-content">
      This content is not draggable, only the handle above
    </div>
  </div>
</tha-drag>
```

## 🎪 Events

The library provides enhanced drag-drop events:

### Drag Element Events

- `thadragstart`: Fired when drag operation begins
- `thadragend`: Fired when drag operation ends
- `thadropzoneenter`: Fired when entering a drop zone
- `thadropzoneleave`: Fired when leaving a drop zone
- `thadropzoneover`: Fired while over a drop zone
- `thadropped`: Fired when successfully dropped

### Drop Zone Events

- `thadragenter`: Fired when draggable enters the zone
- `thadragleave`: Fired when draggable leaves the zone
- `thadragover`: Fired while draggable is over the zone
- `thadrop`: Fired when item is dropped
- `thadropend`: Fired when drop operation completes

### Event Usage

```javascript
document.addEventListener('thadragstart', (event) => {
  console.log('Drag started:', event.name);
  console.log('Drag data:', event.dragData);
});

document.addEventListener('thadrop', (event) => {
  console.log('Item dropped:', event.name);
  event.acceptDrop(); // Accept the drop operation
});
```

## 🎨 Styling

The library provides CSS custom properties for advanced styling:

```css
tha-drag {
  --tha-offset-x: 10px;
  --tha-offset-y: 10px;
}

tha-drag[dragging] {
  opacity: 0.7;
  transform: rotate(5deg);
}

tha-dropzone[acceptable-drag] {
  border: 2px dashed #007acc;
  background-color: #f0f8ff;
}

tha-dropzone[item-dragged] {
  border-color: #28a745;
  background-color: #e8f5e8;
}
```

## 🔧 Advanced Usage

### Custom Data Transfer

```html
<tha-drag 
  name="product" 
  data-drag-id="12345"
  data-drag-price="29.99"
  data-drag-category="electronics">
  <div>Product Item</div>
</tha-drag>
```

```javascript
document.addEventListener('thadrop', (event) => {
  const productData = event.dragData;
  console.log(`Product ID: ${productData.id}`);
  console.log(`Price: $${productData.price}`);
  console.log(`Category: ${productData.category}`);
});
```

### Conditional Drop Acceptance

```javascript
document.addEventListener('thadrop', (event) => {
  const draggedElement = event.dragTarget.deref();
  const dropZone = event.dropzoneTarget.deref();
  
  // Custom validation logic
  if (isValidDrop(draggedElement, dropZone)) {
    event.acceptDrop();
  }
});
```

## 📱 Browser Support

This library works in all modern browsers that support:
- Custom Elements v1
- Shadow DOM v1
- ES2020+ features

## 🛠️ Development

This library is part of the [ThalesRC](https://github.com/thalesrc/thalesrc) monorepo and was built with [Nx](https://nx.dev).

### Building

```bash
nx build drag-drop
```

### Running Tests

```bash
nx test drag-drop
```

### Running Storybook

```bash
nx storybook drag-drop
```

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](https://github.com/thalesrc/thalesrc/blob/main/CONTRIBUTING.md) first.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://drag-drop.thalesrc.com)
- [GitHub Repository](https://github.com/thalesrc/thalesrc)
- [npm Package](https://www.npmjs.com/package/@thalesrc/drag-drop)
- [Issues](https://github.com/thalesrc/thalesrc/issues)
