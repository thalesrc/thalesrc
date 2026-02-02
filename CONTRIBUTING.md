# Contributing to Thalesrc

Thank you for your interest in contributing to Thalesrc! This document provides guidelines and instructions for contributing to this monorepo.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing Guidelines](#testing-guidelines)
- [Code Style and Quality](#code-style-and-quality)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Getting Help](#getting-help)

## Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to alisahinozcelik@gmail.com.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later)
- **pnpm** (v8 or later) - This project uses pnpm as the package manager
- **Git**

### Quick Start

1. **Fork and clone the repository:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/thalesrc.git
   cd thalesrc
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Verify the setup:**

   ```bash
   # Run tests for a specific library
   pnpm nx test js-utils
   
   # Build a library
   pnpm nx build js-utils
   ```

## Development Setup

### Understanding the Monorepo

This project is built with [Nx](https://nx.dev), a powerful build system for monorepos, and uses [pnpm](https://pnpm.io) for package management.

### Running Commands

**Important:** Always use `pnpm nx` when running Nx commands:

```bash
# ✅ Correct
pnpm nx test js-utils
pnpm nx build drag-drop
pnpm nx run hermes:test:browser

# ❌ Incorrect
nx test js-utils
npm run test
```

### Common Commands

```bash
# Run tests for a specific library
pnpm nx test <library-name>

# Build a library
pnpm nx build <library-name>

# Lint a library
pnpm nx lint <library-name>

# Run all tests in the workspace
pnpm nx run-many -t test

# Build all libraries
pnpm nx run-many -t build

# Visualize the project graph
pnpm nx graph

# Run tests in browser mode (for libraries that support it)
pnpm nx run <library-name>:test:browser

# Run Storybook (for libraries that have it)
pnpm nx storybook <library-name>
```

## Project Structure

```
thalesrc/
├── libs/                      # All library packages
│   ├── js-utils/              # JavaScript utilities
│   ├── ts-utils/              # TypeScript utilities
│   ├── drag-drop/             # Drag & drop library
│   ├── hermes/                # Cross-context messaging
│   ├── elements/              # Web components
│   ├── react-utils/           # React utilities
│   ├── rx-utils/              # RxJS utilities
│   └── ...                    # Other libraries
├── apps/                      # Applications (if any)
├── .github/                   # GitHub workflows and configurations
│   └── instructions/          # Development guidelines
├── docs/                      # Documentation
├── nx.json                    # Nx configuration
├── package.json               # Root package.json
├── tsconfig.base.json         # Base TypeScript configuration
└── pnpm-lock.yaml            # Lock file
```

Each library in `libs/` typically contains:

```
libs/library-name/
├── src/                       # Source code
│   ├── index.ts              # Main entry point
│   └── lib/                  # Library implementation
├── README.md                  # Library documentation
├── package.json              # Library-specific metadata
├── project.json              # Nx project configuration
├── tsconfig.json             # TypeScript config
├── tsconfig.lib.json         # Library build config
├── tsconfig.spec.json        # Test config
├── jest.config.ts            # Jest configuration (if applicable)
└── vite.config.ts            # Vite configuration (if applicable)
```

## Making Changes

### Finding What to Work On

- Browse the [Issues](https://github.com/thalesrc/thalesrc/issues) page
- Look for issues labeled `good first issue` or `help wanted`
- Check the [Discussions](https://github.com/thalesrc/thalesrc/discussions) for ideas
- Propose new features or improvements

### Development Workflow

1. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix-name
   ```

2. **Make your changes:**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed
   - Keep changes focused and atomic

3. **Test your changes:**

   ```bash
   # Test the specific library you modified
   pnpm nx test <library-name>
   
   # Run linting
   pnpm nx lint <library-name>
   
   # Build the library
   pnpm nx build <library-name>
   ```

4. **Commit your changes:**

   ```bash
   git add .
   git commit -m "feat(library-name): add new feature"
   ```

### Dependencies Management

**Important Guidelines:**

- Always use **pnpm** for package management
- Install dependencies at the **root level** (workspace root)
- Avoid adding dependencies in individual library `package.json` files unless absolutely necessary

```bash
# Install a dependency at the root
pnpm add <package-name>

# Install a dev dependency at the root
pnpm add -D <package-name>
```

### Build Independence

Libraries in this monorepo are designed to be **build-independent**:

- Libraries should not require other libraries to be built first
- Development tools (testing, Storybook, etc.) use path resolvers in bundlers
- TypeScript path mappings are configured in `tsconfig.base.json`

## Testing Guidelines

### Writing Tests

- Write tests for all new features and bug fixes
- Follow existing test patterns in the library
- Aim for meaningful test coverage
- Test edge cases and error scenarios

### Running Tests

```bash
# Run tests for a specific library
pnpm nx test js-utils

# Run tests in watch mode
pnpm nx test js-utils --watch

# Run tests with coverage
pnpm nx test js-utils --coverage

# Run browser tests (for libraries that support it)
pnpm nx run hermes:test:browser
```

### Test Types

Different libraries may use different testing frameworks:

- **Jest** - Most libraries use Jest for unit testing
- **Vitest** - Some libraries use Vitest, especially for browser testing
- **Storybook** - Component libraries may have Storybook tests

## Code Style and Quality

### Code Formatting

This project uses [Prettier](https://prettier.io/) for code formatting:

```bash
# Format code (if a format script exists)
pnpm format

# Check formatting
pnpm prettier --check .
```

### Linting

ESLint is used for code quality:

```bash
# Lint a specific library
pnpm nx lint <library-name>

# Lint all libraries
pnpm nx run-many -t lint
```

### TypeScript Guidelines

- Use explicit types over implicit ones
- Avoid using `any` - prefer `unknown` or proper types
- Export types and interfaces that might be useful for consumers
- Use type guards for runtime type checking
- Leverage TypeScript utility types

See [TypeScript Guidelines](.github/instructions/typescript.instructions.md) for more details.

## Commit Guidelines

We follow conventional commit messages for consistency:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD changes

### Scope

The scope should be the name of the affected library (e.g., `js-utils`, `hermes`, `drag-drop`).

### Examples

```bash
feat(js-utils): add new array utility function
fix(hermes): resolve iframe message handling issue
docs(drag-drop): update usage examples in README
test(rx-utils): add tests for toAsyncIterable
refactor(elements): simplify router implementation
```

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass:**

   ```bash
   pnpm nx test <library-name>
   ```

2. **Build successfully:**

   ```bash
   pnpm nx build <library-name>
   ```

3. **Lint passes:**

   ```bash
   pnpm nx lint <library-name>
   ```

4. **Update documentation:**
   - Update README.md if you added new features
   - Add JSDoc comments for public APIs
   - Update examples if needed

### Submitting a Pull Request

1. **Push your branch:**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - A clear title following commit conventions
   - A detailed description of changes
   - References to related issues (e.g., "Closes #123")
   - Screenshots for UI changes (if applicable)

3. **Wait for review:**
   - Address review comments promptly
   - Make requested changes in new commits
   - Re-request review after making changes

4. **After approval:**
   - Maintainers will merge your PR
   - Your changes will be included in the next release

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #(issue number)

## Testing
- [ ] All tests pass
- [ ] Added new tests for new features
- [ ] Updated existing tests

## Documentation
- [ ] Updated README
- [ ] Added JSDoc comments
- [ ] Updated examples

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

## Release Process

Releases are managed by maintainers using automated workflows:

1. Changes are merged to the main branch
2. Release PRs are created automatically
3. Version bumps follow semantic versioning
4. Packages are published to npm automatically

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Getting Help

### Resources

- **Documentation**: [https://open-source.thalesrc.com](https://open-source.thalesrc.com)
- **Issues**: [GitHub Issues](https://github.com/thalesrc/thalesrc/issues)
- **Discussions**: [GitHub Discussions](https://github.com/thalesrc/thalesrc/discussions)
- **Website**: [https://thalesrc.com](https://thalesrc.com)

### Communication

- **Questions**: Use [GitHub Discussions](https://github.com/thalesrc/thalesrc/discussions)
- **Bug Reports**: Use [GitHub Issues](https://github.com/thalesrc/thalesrc/issues)
- **Email**: alisahinozcelik@gmail.com

### Additional Guidelines

For more detailed guidelines, see:

- [General Guidelines](.github/instructions/general.instructions.md)
- [TypeScript Guidelines](.github/instructions/typescript.instructions.md)
- [Nx Guidelines](.github/instructions/nx.instructions.md)

## Thank You!

Your contributions make this project better! We appreciate your time and effort in helping improve Thalesrc. 🎉

---

**Made with ❤️ by [Thalesrc](https://github.com/thalesrc)**
