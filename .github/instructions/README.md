# AI Agent Instructions

This directory contains instruction files for AI coding assistants (GitHub Copilot, Azure AI, etc.).

## Structure

- `general.instructions.md` - Global rules for the entire monorepo
- `typescript.instructions.md` - TypeScript-specific guidelines
- `nx.instructions.md` - Nx workspace guidelines (auto-generated)

## Adding New Instructions

Create a new `.instructions.md` file with frontmatter:

```markdown
---
applyTo: 'path/pattern/**'
---

Your instructions here...
```

### ApplyTo Patterns

- `**` - All files
- `**/*.ts` - All TypeScript files
- `libs/specific-lib/**` - Specific library
- `**/*.spec.ts` - Test files only

## Per-Library Instructions

You can also add `.instructions.md` files directly in library folders for library-specific rules.
