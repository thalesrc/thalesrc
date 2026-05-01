# Repository Agent Guidelines

These rules apply to any AI agent (Copilot, Claude, etc.) working in this repository, in addition to anything declared in `.github/instructions/`.

## File Size & Separation of Concerns

- **Keep files small and focused.** A file should do one thing well.
- **Split files when they grow.** When a single file accumulates multiple unrelated concerns (parsing, rendering, lifecycle, utilities, types, …), extract each concern into its own sibling module.
- **Prefer many small siblings over one large file.** Co-locate split modules next to their consumer (e.g. `popover/position.ts` next to `popover/popover-element.ts`).
- Keep public exports surfaced through the package/folder `index.ts` so consumers are unaffected by internal splits.
- Apply the same rule to tests, stories, and docs: split them whenever they outgrow a single focused topic.

When in doubt, split.
