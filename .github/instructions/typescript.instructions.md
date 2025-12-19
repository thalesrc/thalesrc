---
applyTo: '**/*.ts'
---

# TypeScript Guidelines

## Type Safety
- Prefer explicit types over implicit ones
- Avoid using `any` - use `unknown` or proper types instead
- Use strict TypeScript configuration

## Code Style
- Use consistent naming conventions (camelCase for variables, PascalCase for types)
- Export types and interfaces that might be useful for consumers
- Prefer `interface` for object shapes, `type` for unions/intersections

## Best Practices
- Use type guards for runtime type checking
- Leverage TypeScript utility types (Partial, Pick, Omit, etc.)
- Keep type definitions close to their usage
