# Router Components

A set of web components for client-side routing in single-page applications, built with Lit and signals for reactive state management.

## Overview

The router system provides declarative, template-based routing without requiring JavaScript configuration. Routes are defined using custom elements directly in your HTML, and the router automatically handles navigation, URL matching, and content rendering.

### Key Features

- **Declarative routing**: Define routes using HTML elements
- **Template-based content**: Route content is defined in `<template>` elements
- **Multiple history strategies**: Browser History API, hash-based, or memory-based
- **Active link detection**: Automatically highlights active navigation links
- **Relative navigation**: Support for relative paths (`./`, `../`)
- **URLPattern matching**: Powerful pattern matching with dynamic segments
- **Reactive updates**: Built on signals for efficient rendering

## Components

### `<tha-router>`

The main router component that manages routing for a section of your application.

**Attributes:**
- `history` (optional): History management strategy - `"browser"` (default), `"hash"`, `"memory"`, or `"memory:name"`

**Example:**
```html
<tha-router history="browser">
  <tha-route path="/"><template><h1>Home</h1></template></tha-route>
  <tha-route path="/about"><template><h1>About</h1></template></tha-route>
  <tha-router-outlet></tha-router-outlet>
</tha-router>
```

### `<tha-route>`

Defines a route with a URL pattern and template content.

**Attributes:**
- `path` (required): URL pattern using URLPattern syntax (e.g., `/users/:id`)

**Content:**
- Must contain a `<template>` element with the content to render

**Example:**
```html
<tha-route path="/users/:id">
  <template>
    <h1>User Profile</h1>
  </template>
</tha-route>
```

### `<tha-router-outlet>`

Renders the content of the active route.

**Attributes:**
- `for` (optional): ID of a specific router to bind to (otherwise binds to nearest parent)
- `routepath` (readonly): Reflects the current route's path
- `routeid` (readonly): Reflects the current route's ID
- `param-*` (readonly): Dynamic attributes for each route parameter (e.g., `param-id`, `param-year`)

**Properties:**
- `params`: Object containing all current route parameters

**Example 1: Inside tha-router element**
```html
<tha-router>
  <tha-route path="/"><template><h1>Home</h1></template></tha-route>
  <tha-route path="/about"><template><h1>About</h1></template></tha-route>
  <!-- Outlet automatically binds to parent router -->
  <tha-router-outlet></tha-router-outlet>
</tha-router>
```

**Example 2: Outside tha-router element**
```html
<!-- Router with ID -->
<tha-router id="main-router">
  <tha-route path="/"><template><h1>Home</h1></template></tha-route>
  <tha-route path="/about"><template><h1>About</h1></template></tha-route>
</tha-router>

<!-- Outlet outside router, binds using 'for' attribute -->
<tha-router-outlet for="main-router"></tha-router-outlet>
```

**Example 3: Accessing route parameters**
```html
<tha-router>
  <tha-route path="/products/:category/:id">
    <template>
      <h1>Product Details</h1>
      <!-- Use tha-router-param for declarative access -->
      <p>Category: <tha-router-param name="category"></tha-router-param></p>
      <p>Product ID: <tha-router-param name="id"></tha-router-param></p>
    </template>
  </tha-route>
  <tha-router-outlet id="product-outlet"></tha-router-outlet>
</tha-router>

<script>
  // Or access params programmatically via the outlet
  const outlet = document.getElementById('product-outlet');
  console.log(outlet.params); // { category: 'electronics', id: '123' }
  console.log(outlet.getAttribute('param-category')); // 'electronics'
  console.log(outlet.getAttribute('param-id')); // '123'
</script>
```

**Example 4: Nested outlets with parameter inheritance**
```html
<tha-router>
  <tha-route path="/projects/:projectId">
    <template>
      <h1>Project <tha-router-param name="projectId"></tha-router-param></h1>
      
      <!-- Nested outlet inherits projectId parameter -->
      <tha-router-outlet>
        <tha-route path="/tasks/:taskId">
          <template>
            <!-- Both parameters available -->
            <p>Project: <tha-router-param name="projectId"></tha-router-param></p>
            <p>Task: <tha-router-param name="taskId"></tha-router-param></p>
          </template>
        </tha-route>
      </tha-router-outlet>
    </template>
  </tha-route>
  <tha-router-outlet></tha-router-outlet>
</tha-router>
```

### `<tha-router-link>`

Navigation link that performs client-side routing without page reloads.

**Attributes:**
- `to` (required): Navigation target - absolute path (`/about`), relative path (`./details`, `../users`), or history symbol (`back`, `forward`)
- `history` (optional): Specific history instance to use
- `active` (readonly): Reflects whether the link matches the current route

**Example:**
```html
<!-- Absolute paths -->
<tha-router-link to="/">Home</tha-router-link>
<tha-router-link to="/about">About</tha-router-link>

<!-- Relative paths -->
<tha-router-link to="./details">Details</tha-router-link>
<tha-router-link to="..">Back to Users</tha-router-link>

<!-- History navigation -->
<tha-router-link to="back">← Back</tha-router-link>
<tha-router-link to="forward">Forward →</tha-router-link>

<!-- Style active links with CSS -->
<style>
  tha-router-link[active] {
    font-weight: bold;
    color: blue;
  }
</style>
```

### `<tha-router-param>`

Displays the value of a dynamic route parameter.

**Attributes:**
- `name` (required): The parameter name to display (must match a parameter in the route path)

**Requirements:**
- Must be used inside a `<tha-router-outlet>` element
- Parameter name must exist in the current route's path pattern

**Example:**
```html
<tha-router>
  <tha-route path="/users/:id">
    <template>
      <h1>User Profile</h1>
      <p>User ID: <tha-router-param name="id"></tha-router-param></p>
    </template>
  </tha-route>
  <tha-router-outlet></tha-router-outlet>
</tha-router>

<!-- Navigating to /users/123 displays: User ID: 123 -->
```

**Multiple Parameters:**
```html
<tha-route path="/blog/:year/:month/:slug">
  <template>
    <article>
      <time>
        <tha-router-param name="year"></tha-router-param>-
        <tha-router-param name="month"></tha-router-param>
      </time>
      <h1><tha-router-param name="slug"></tha-router-param></h1>
    </article>
  </template>
</tha-route>

<!-- /blog/2024/12/hello-world displays: 2024-12 and hello-world -->
```

**Styling Parameters:**
```html
<style>
  tha-router-param {
    font-weight: bold;
    color: var(--primary-color);
  }
  
  tha-router-param[name="id"] {
    font-family: monospace;
  }
</style>
```

### `<tha-router-config>`

Configuration element for managing router history settings. Behavior depends on placement:

**In `<head>` (Global Configuration):**
- Sets the default history strategy for all routers
- Affects routers that don't specify their own history
- Only one should be placed in `<head>`

**In `<body>` (Local Configuration):**
- Provides history to descendant routers only
- Allows different sections to use different strategies
- Can have multiple instances for different sections

**Attributes:**
- `history`: History strategy - `"browser"` (default), `"hash"`, `"memory"`, or `"memory:name"`

**Example (Global):**
```html
<head>
  <!-- All routers use hash by default -->
  <tha-router-config history="hash"></tha-router-config>
</head>
```

**Example (Local):**
```html
<body>
  <!-- Section 1: Hash routing -->
  <tha-router-config history="hash">
    <tha-router>...</tha-router>
  </tha-router-config>
  
  <!-- Section 2: Memory routing (isolated) -->
  <tha-router-config history="memory">
    <tha-router>...</tha-router>
  </tha-router-config>
</body>
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Global router configuration -->
  <tha-router-config history="browser"></tha-router-config>
  
  <style>
    nav {
      padding: 1rem;
      background: #f0f0f0;
    }
    
    tha-router-link {
      margin-right: 1rem;
      text-decoration: none;
      color: #333;
    }
    
    tha-router-link[active] {
      font-weight: bold;
      color: #0066cc;
      border-bottom: 2px solid #0066cc;
    }
  </style>
</head>
<body>
  <nav>
    <tha-router-link to="/">Home</tha-router-link>
    <tha-router-link to="/about">About</tha-router-link>
    <tha-router-link to="/users">Users</tha-router-link>
  </nav>

  <!-- Main router inherits browser history from head config -->
  <tha-router>
    <tha-route path="/">
      <template>
        <h1>Home Page</h1>
        <p>Welcome to our application!</p>
        <tha-router-link to="/about">Learn more about us</tha-router-link>
      </template>
    </tha-route>

    <tha-route path="/about">
      <template>
        <h1>About Us</h1>
        <p>This is the about page.</p>
        <tha-router-link to="back">Go back</tha-router-link>
      </template>
    </tha-route>

    <tha-route path="/users">
      <template>
        <h1>Users</h1>
        <ul>
          <li><tha-router-link to="/users/1">User 1</tha-router-link></li>
          <li><tha-router-link to="/users/2">User 2</tha-router-link></li>
        </ul>
      </template>
    </tha-route>

    <tha-route path="/users/:id">
      <template>
        <h1>User Profile</h1>
        <p>Viewing user profile</p>
        <tha-router-link to="..">Back to users list</tha-router-link>
      </template>
    </tha-route>

    <tha-router-outlet></tha-router-outlet>
  </tha-router>
</body>
</html>
```

## Route Parameters

Route parameters allow you to create dynamic routes that match variable segments in URLs. Parameters are extracted from the URL and made available within route templates.

### Defining Parameters

Parameters are defined in route paths using the `:paramName` syntax:

```html
<tha-route path="/users/:id">
  <template>
    <!-- Parameter 'id' is available here -->
  </template>
</tha-route>
```

### Accessing Parameters

#### Option 1: Using `<tha-router-param>` (Declarative)

The recommended approach for templates:

```html
<tha-route path="/users/:id">
  <template>
    <h1>User <tha-router-param name="id"></tha-router-param></h1>
  </template>
</tha-route>
```

#### Option 2: Via Outlet Attributes

Parameters are exposed as `param-*` attributes on the outlet:

```html
<tha-router-outlet id="outlet">
  <!-- When route /users/123 is active -->
  <!-- outlet will have param-id="123" attribute -->
</tha-router-outlet>

<script>
  const outlet = document.getElementById('outlet');
  const userId = outlet.getAttribute('param-id'); // '123'
</script>
```

#### Option 3: Via Outlet Properties

Access all parameters as an object:

```javascript
const outlet = document.querySelector('tha-router-outlet');
console.log(outlet.params); // { id: '123' }
```

### Multiple Parameters

Routes can have multiple parameters:

```html
<tha-route path="/blog/:year/:month/:slug">
  <template>
    <article>
      <header>
        <time>
          <tha-router-param name="year"></tha-router-param>-
          <tha-router-param name="month"></tha-router-param>
        </time>
        <h1><tha-router-param name="slug"></tha-router-param></h1>
      </header>
    </article>
  </template>
</tha-route>

<!-- Matches: /blog/2024/12/hello-world -->
<!-- Params: { year: '2024', month: '12', slug: 'hello-world' } -->
```

### Parameter Inheritance

Nested outlets inherit parameters from parent routes:

```html
<tha-router>
  <tha-route path="/projects/:projectId">
    <template>
      <h1>Project <tha-router-param name="projectId"></tha-router-param></h1>
      
      <tha-router-outlet>
        <tha-route path="/tasks/:taskId">
          <template>
            <!-- Both parameters available -->
            <p>Project: <tha-router-param name="projectId"></tha-router-param></p>
            <p>Task: <tha-router-param name="taskId"></tha-router-param></p>
          </template>
        </tha-route>
      </tha-router-outlet>
    </template>
  </tha-route>
  <tha-router-outlet></tha-router-outlet>
</tha-router>

<!-- URL: /projects/proj-1/tasks/task-42 -->
<!-- Child outlet has: { projectId: 'proj-1', taskId: 'task-42' } -->
```

Child parameters override parent parameters with the same name.

### Styling Parameters

You can style parameter display using CSS:

```css
/* Style all parameters */
tha-router-param {
  font-weight: bold;
  color: var(--primary-color);
}

/* Style specific parameters by name */
tha-router-param[name="id"] {
  font-family: monospace;
  background: #f0f0f0;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

tha-router-param[name="year"],
tha-router-param[name="month"] {
  color: #666;
}
```

## URL Pattern Syntax

Routes use the [URLPattern API](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern) for matching:

### Static Paths
```html
<tha-route path="/"><template>Home</template></tha-route>
<tha-route path="/about"><template>About</template></tha-route>
<tha-route path="/contact"><template>Contact</template></tha-route>
```

### Dynamic Segments
```html
<!-- Match /users/123 -->
<tha-route path="/users/:id"><template>User Profile</template></tha-route>

<!-- Match /blog/2024/hello-world -->
<tha-route path="/blog/:year/:slug"><template>Blog Post</template></tha-route>
```

### Wildcards
```html
<!-- Match /blog, /blog/post, /blog/post/123 -->
<tha-route path="/blog/*"><template>Blog Section</template></tha-route>

<!-- Match any path under /docs -->
<tha-route path="/docs/**"><template>Documentation</template></tha-route>
```

## History Strategies

### Browser History (default)
Uses the HTML5 History API (`pushState`, `replaceState`). URLs are clean without hash fragments.

```html
<tha-router history="browser">
  <!-- URLs: /, /about, /users/123 -->
</tha-router>
```

**Requires:** Server-side configuration to serve `index.html` for all routes.

### Hash History
Uses hash fragments in the URL. Works without server configuration.

```html
<tha-router history="hash">
  <!-- URLs: /#/, /#/about, /#/users/123 -->
</tha-router>
```

### Memory History
In-memory history for testing or non-browser environments.

```html
<tha-router history="memory">
  <!-- No URL changes -->
</tha-router>

<!-- Named instances for isolation -->
<tha-router history="memory:test1">...</tha-router>
<tha-router history="memory:test2">...</tha-router>
```

## Navigation

Use `<tha-router-link>` elements for navigation:

```html
<!-- Absolute paths -->
<tha-router-link to="/about">About</tha-router-link>

<!-- Relative paths -->
<tha-router-link to="./details">Details</tha-router-link>
<tha-router-link to="../">Parent</tha-router-link>

<!-- History navigation -->
<tha-router-link to="back">Back</tha-router-link>
<tha-router-link to="forward">Forward</tha-router-link>
```

## Multiple Routers

You can have multiple routers in your application, each with different history strategies:

```html
<head>
  <!-- Set global default to browser history -->
  <tha-router-config history="browser"></tha-router-config>
</head>
<body>
  <!-- Main router uses browser history from global config -->
  <tha-router>
    <tha-route path="/"><template>Home</template></tha-route>
    <tha-route path="/dashboard"><template>Dashboard</template></tha-route>
    <tha-router-outlet></tha-router-outlet>
  </tha-router>

  <!-- Admin section with hash history (overrides global) -->
  <tha-router history="hash">
    <tha-route path="/users"><template>Users</template></tha-route>
    <tha-route path="/settings"><template>Settings</template></tha-route>
    <tha-router-outlet></tha-router-outlet>
  </tha-router>
  
  <!-- Widget with isolated memory history -->
  <tha-router-config history="memory:widget">
    <tha-router>
      <tha-route path="/step1"><template>Step 1</template></tha-route>
      <tha-route path="/step2"><template>Step 2</template></tha-route>
      <tha-router-outlet></tha-router-outlet>
    </tha-router>
  </tha-router-config>
</body>
```

## Styling

### Active Links

The `active` attribute is automatically added to `<tha-router-link>` elements when their path matches:

```css
tha-router-link[active] {
  font-weight: bold;
  color: var(--active-link-color);
  border-bottom: 2px solid currentColor;
}
```

### Route Outlet

The outlet renders content in light DOM, so you can style it directly:

```css
tha-router-outlet {
  display: block;
  padding: 2rem;
  min-height: 400px;
}
```

## TypeScript Support

All components are fully typed with TypeScript. Types are automatically inferred through `HTMLElementTagNameMap`:

```typescript
// Types are inferred automatically - no need for type assertions
const router = document.querySelector('tha-router');
const outlet = document.querySelector('tha-router-outlet');
const link = document.querySelector('tha-router-link');

// TypeScript knows the correct types:
router?.assignOutlet(outlet);
link?.addEventListener('click', (e) => { /* ... */ });
```

## Browser Support

- Modern browsers with Web Components support
- URLPattern API (or polyfill required for older browsers)
- ES2024+ features

## License

MIT © [Thalesrc](https://github.com/thalesrc)
