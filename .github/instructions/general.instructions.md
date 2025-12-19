---
applyTo: '**'
---

# General Coding Guidelines for Thalesrc Monorepo

## Repository Structure
- This is a pnpm monorepo managed by Nx
- All libraries are in `libs/` directory
- Each library is independent and publishable

## Dependencies Management
- **Always use pnpm** for package management
- Install all dependencies and devDependencies at the **root level** (workspace root)
- Do not add dependencies in individual library package.json files unless absolutely necessary

## Build Independence
- Libraries must **not require other libraries to be built** first
- For development services (testing, Storybook, demos, etc.), configure **path resolvers in bundlers** (Vite, Webpack, etc.)
- TypeScript path mappings are defined in the **top-level tsconfig.base.json**
- Bundlers should resolve these paths at development/build time without requiring pre-built artifacts

## Code Quality Standards
- Write clean, maintainable, and well-documented code
- Follow existing patterns in the codebase
- Maintain backward compatibility when modifying existing libraries

## Documentation
- Update README.md when adding new features
- Add JSDoc comments for public APIs
- Keep changelogs up to date

## Testing
- Write tests for new features
- Ensure existing tests pass before committing
- Aim for meaningful test coverage, not just high percentages
