# 🛠️ Internal Tooling & Scripts Guide

This document provides a detailed overview of the custom scripts and tools used to maintain and scale the Micro-Frontend Base Platform.

## 0. Unified CLI (`pnpm cli`)

This is the recommended entry point for all project automation. It provides an interactive menu to access all tools listed below.

```bash
pnpm cli
```

---

Located at: `scripts/create-app.mjs`

### Usage

```bash
pnpm create-app
```

### What it does:

- **Interactive Prompts**: The scaffolding script supports multiple frameworks:
  - **React** (Vite + Remix)
  - **Vue** (Composition API)
  - **Svelte** (Vite)
  - **SolidJS** (Vite)
- **Template Cloning**: Clones the basic structure from an existing "source" app.
- **Auto-Configuration**:
  - Updates `package.json` with the new app name.
  - Updates `public/manifest.json` for Module Federation registration.
  - Generates a custom `README.md` for the new app.
- **Root Integration**: Automatically adds a `dev:<app-name>` script to the root `package.json` for easy access.

---

## 2. UI Component Generator (`pnpm generate-ui`)

Located at: `scripts/generate-ui.mjs`

### Usage

```bash
# From the root
pnpm generate-ui

# Or within packages/ui
cd packages/ui && pnpm generate
```

### What it does:

- **Component Scaffolding**: Creates a new folder in `packages/ui/src/components/react/`.
- **Skeleton Code**: Generates a TypeScript component using `React.forwardRef` and `cn` utility.
- **Stories**: Creates a default Storybook story (`.stories.tsx`) for immediate visual testing.
- **Exports**: Automatically appends the new component to `packages/ui/src/index.ts`.

---

## 3. Smart Docker Build (`scripts/smart-docker-build.js`)

Located at: `scripts/smart-docker-build.js`

This script is the backbone of our CI/CD optimization. It ensures we don't build Docker images for applications that haven't changed.

### Usage

```bash
# Dry Run (Default)
node scripts/smart-docker-build.js

# Execute Build
EXECUTE=true node scripts/smart-docker-build.js

# Force Build All
FORCE_ALL=true EXECUTE=true node scripts/smart-docker-build.js
```

### Key Logic:

1.  **Change Detection**: Uses Turborepo's hashing (`turbo run build --dry-run=json`) to identify which packages in the `apps/` directory have modified files or dependencies.
2.  **Configuration Overrides**: Reads an optional `"mfe"` block in each app's `package.json` to customize:
    - Custom `Dockerfile`
    - Build arguments
    - Target image name

---

## 4. Environment Check (`scripts/onboard.sh`)

(In Progress) This script validates that a developer's machine has the correct versions of Node, pnpm, and Docker installed.

### Usage

```bash
bash scripts/onboard.sh
```

---

## 💡 Best Practices for Tooling

- **Always use the generators**: Avoid manual copying of folders to prevent configuration drift.
- **Keep scripts framework-agnostic**: When possible, write logic that works across React, Vue, and Svelte.
- **Update documentation**: If you change a script's behavior, update this guide!
