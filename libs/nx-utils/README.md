# @thalesrc/nx-utils

[![npm version](https://img.shields.io/npm/v/@thalesrc/nx-utils.svg)](https://www.npmjs.com/package/@thalesrc/nx-utils)
[![npm downloads](https://img.shields.io/npm/dm/@thalesrc/nx-utils.svg)](https://www.npmjs.com/package/@thalesrc/nx-utils)
[![license](https://img.shields.io/npm/l/@thalesrc/nx-utils.svg)](https://github.com/thalesrc/thalesrc/blob/main/libs/nx-utils/LICENSE)

A collection of powerful Nx executors for monorepo projects, providing enhanced build tooling, file operations, and task management capabilities.

## Installation

```bash
npm install @thalesrc/nx-utils
```

```bash
yarn add @thalesrc/nx-utils
```

```bash
pnpm add @thalesrc/nx-utils
```

## Executors

### 📦 Copy

Copy files with advanced features like content replacement, image resizing, and glob pattern support.

**Usage:**

```json
{
  "targets": {
    "copy-assets": {
      "executor": "@thalesrc/nx-utils:copy",
      "options": {
        "input": "src/assets/**/*",
        "output": "dist/assets",
        "watch": false
      }
    }
  }
}
```

**Options:**

- `input` (required): File glob pattern, input object, or array of patterns/objects
  - Simple string: `"src/assets/**/*"`
  - Object with options:
    - `path`: File glob pattern
    - `output`: Custom output path for this input
    - `replace`: Replace strings in file content (supports environment variables with `#{ENV_VAR}`)
    - `resize`: Resize images (number, `[width, height]`, or object for multiple sizes)
- `output`: Base output directory
- `watch`: Watch for file changes (default: `false`)

**Example with advanced features:**

```json
{
  "executor": "@thalesrc/nx-utils:copy",
  "options": {
    "input": [
      {
        "path": "src/config.json",
        "output": "dist",
        "replace": {
          "VERSION": "1.0.0",
          "BUILD_DATE": "#{BUILD_DATE_ENV}"
        }
      },
      {
        "path": "src/icon.png",
        "output": "dist/icons",
        "resize": {
          "20x20": "{name}-20x20.{ext}",
          "40x40": "{name}-40x40.{ext}",
          "128x128": "{name}-128x128.{ext}"
        }
      }
    ],
    "output": "dist"
  }
}
```

---

### 📝 Fill Package JSON

Generate and populate `package.json` files with automatic exports configuration.

**Usage:**

```json
{
  "targets": {
    "fill-package": {
      "executor": "@thalesrc/nx-utils:fill-package-json",
      "options": {
        "outputPath": "dist/libs/my-lib",
        "packageVersion": "1.0.0"
      }
    }
  }
}
```

**Options:**

- `outputPath` (required): Output path for the `package.json` file
- `packageVersion`: Version to set in the `package.json`
- `populateExports`: Configure automatic exports generation
  - `exports`: Array of export types (`'require'`, `'default'`, `'import'`, `'node'`, `'types'`)
  - `exportsTemplateProperty`: Property name for export templates (default: `'_exports'`)
  - `barrelFileName`: Name of the barrel file (default: `'index.js'`)
  - `templates`: Custom templates for each export type

**Example with exports:**

```json
{
  "executor": "@thalesrc/nx-utils:fill-package-json",
  "options": {
    "outputPath": "dist/libs/my-lib",
    "packageVersion": "1.0.0",
    "populateExports": {
      "exports": ["require", "import", "types"],
      "barrelFileName": "index.js"
    }
  }
}
```

---

### 🔄 Run Parallel

Execute multiple commands in parallel with sequential readiness control.

**Usage:**

```json
{
  "targets": {
    "dev": {
      "executor": "@thalesrc/nx-utils:run-parallel",
      "options": {
        "commands": [
          {
            "command": "nx serve api",
            "readyWhen": "ready on",
            "stopWhenReady": false
          },
          "nx serve web"
        ]
      }
    }
  }
}
```

**Options:**

- `commands` (required): Array of commands (string or object)
  - Simple string: `"npm run build"`
  - Object:
    - `command`: Command or array of commands to run
    - `cwd`: Working directory for the command
    - `readyWhen`: String(s) to look for in output to determine readiness
    - `stopWhenReady`: Stop the process when ready signal is detected
- `cwd`: Default working directory for all commands
- `aliases`: Key-value pairs to replace in commands (use `<<key>>` syntax)

**Example with aliases:**

```json
{
  "executor": "@thalesrc/nx-utils:run-parallel",
  "options": {
    "commands": [
      "nx serve <<app>>",
      "nx test <<app>> --watch"
    ],
    "aliases": {
      "app": "my-app"
    }
  }
}
```

---

### 🔨 TypeScript Builder

Build TypeScript files with custom configurations and output paths.

**Usage:**

```json
{
  "targets": {
    "build": {
      "executor": "@thalesrc/nx-utils:ts-builder",
      "options": {
        "files": ["src/**/*.ts", "!src/**/*.spec.ts"],
        "outputPath": "dist/libs/my-lib",
        "tsConfigPath": "tsconfig.lib.json"
      }
    }
  }
}
```

**Options:**

- `files`: List of files to compile (default: `['src/**/*.ts', '!src/**/*.spec.ts']`)
- `outputPath`: Destination path relative to workspace root (default: `'dist'`)
- `tsConfigPath`: Path to tsconfig file (default: `'tsconfig.json'`)
  - Use `./` or `../` for relative paths, otherwise treated as workspace-relative

---

### 👀 Watch

Watch files and execute commands on changes with path placeholder support.

**Usage:**

```json
{
  "targets": {
    "watch-assets": {
      "executor": "@thalesrc/nx-utils:watch",
      "options": {
        "glob": "src/**/*.scss",
        "command": "sass <path> dist/<fileName>.css"
      }
    }
  }
}
```

**Options:**

- `glob` (required): Glob pattern(s) to watch
- `command` (required): Command(s) to run on file changes
  - Placeholders:
    - `<path>`: Full file path
    - `<fileName>`: File name without extension
    - `<fileExt>`: File extension
- `platformVariables`: Platform-specific variable replacements (see Platform Runner)

---

### 💻 Platform Runner

Execute scripts with platform-specific variable substitution.

**Usage:**

```json
{
  "targets": {
    "run-script": {
      "executor": "@thalesrc/nx-utils:platform-runner",
      "options": {
        "script": "echo <<greeting>> world",
        "default": {
          "greeting": "Hello"
        },
        "win32": {
          "greeting": "Hello from Windows"
        },
        "darwin": {
          "greeting": "Hello from macOS"
        },
        "linux": {
          "greeting": "Hello from Linux"
        }
      }
    }
  }
}
```

**Options:**

- `script` (required): Script to execute (use `<<variableName>>` for placeholders)
- `default` (required): Default variable values
- `win32`: Windows-specific variables
- `darwin`: macOS-specific variables
- `linux`: Linux-specific variables
- `aix`: AIX-specific variables
- `freebsd`: FreeBSD-specific variables
- `openbsd`: OpenBSD-specific variables
- `sunos`: SunOS-specific variables
- `android`: Android-specific variables

---

### 🔁 Run For Each

Execute a command for each item in a list or glob pattern.

**Usage:**

```json
{
  "targets": {
    "process-files": {
      "executor": "@thalesrc/nx-utils:run-for-each",
      "options": {
        "command": "node process.js <item>",
        "items": ["file1.txt", "file2.txt", "file3.txt"],
        "parallel": true
      }
    }
  }
}
```

**Usage with glob:**

```json
{
  "executor": "@thalesrc/nx-utils:run-for-each",
  "options": {
    "command": "node lint.js <path>",
    "glob": "src/**/*.ts",
    "parallel": false
  }
}
```

**Options:**

- `command` (required): Command to run (`<item>` will be replaced)
- `items`: Array of items to iterate over
- `glob`: Glob pattern to get items from
  - Placeholders:
    - `<path>`: Full file path
    - `<fileName>`: File name without extension
    - `<fileExt>`: File extension
- `parallel`: Run commands in parallel (default: `true`)
- `platformVariables`: Platform-specific variable replacements (see Platform Runner)

---

## Development

### Building

```bash
nx build nx-utils
```

### Running Tests

```bash
nx test nx-utils
```

## License

MIT © [Thalesrc](https://github.com/thalesrc)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [GitHub Repository](https://github.com/thalesrc/thalesrc)
- [npm Package](https://www.npmjs.com/package/@thalesrc/nx-utils)
- [Issues](https://github.com/thalesrc/thalesrc/issues)
