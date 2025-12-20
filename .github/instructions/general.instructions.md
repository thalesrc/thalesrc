---
applyTo: '**'
---

# General Coding Guidelines for Thalesrc Monorepo

## Repository Structure
- This is a pnpm monorepo managed by Nx
- All libraries are in `libs/` directory
- Each library is independent and publishable

## Running Nx Commands
- **Always use `pnpm nx` to run Nx commands**
- Never use standalone `nx` commands (e.g., avoid `nx test`, `nx build`)
- Correct examples:
  - `pnpm nx test mylib`
  - `pnpm nx build mylib`
  - `pnpm nx test:browser hermes`
  - `pnpm nx test:browser hermes -- --browser.headless=false`
- When providing documentation or examples with Nx commands, always prefix with `pnpm nx`

## Dependencies Management
- **Always use pnpm** for package management
- **CRITICAL**: Install all dependencies and devDependencies at the **root level** (workspace root) **IMMEDIATELY** when they are identified as needed
- When creating configurations that require new packages (e.g., Vitest browser mode, Storybook, testing utilities), **ADD THE PACKAGES TO ROOT package.json** as part of the same operation - do not document installation instructions without actually installing
- Do not add dependencies in individual library package.json files unless absolutely necessary
- If you create setup instructions that mention installing packages, those packages must already be in the root package.json

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
