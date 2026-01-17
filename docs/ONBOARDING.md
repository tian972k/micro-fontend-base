# 🚀 Developer Onboarding Guide

Welcome to the **Micro-Front-End Base Platform**! This guide will help you get up and running, understand our architecture, and make your first contribution.

- **Polyglot Remotes**: React, Vue, Svelte, and SolidJS supported via Vite + Federation.

## 🏁 Day 1: Environment Setup

### 1. Requirements

Ensure you have the following installed:

- **Node.js** (v18+ recommended)
- **pnpm** (v8+) - We use `pnpm` for workspace management.
- **Docker & Docker Compose** (for production simulation)

### 2. Initialization

```bash
# Clone the repository
git clone <repo-url>
cd micro-fontend-base

# Install dependencies
pnpm install

# Setup environment variables
cp apps/shell/.env.example apps/shell/.env
```

### 3. Running for the first time

```bash
# Run the entire platform (Shell + all Remotes)
pnpm dev
```

Open [http://localhost:8000](http://localhost:8000) to see the platform in action.

---

## 🏗️ Architecture Overview

The platform is built on a **Hub-and-Spoke** model using **Module Federation**:

1.  **Shell (Host)**: The primary Remix application. It handles routing, authentication, and the global layout.
2.  **Micro-Apps (Remotes)**: Independent applications (React, Next.js, Vue, Svelte) that are loaded into the Shell at runtime.
3.  **Core Package (`@repo/core`)**: The shared "brain" containing state management, logging, and MFE orchestration.
4.  **UI Package (`@repo/ui`)**: The shared design system built with shadcn/ui and Tailwind.

### Key Concepts

- **MfeHost**: A React component in `@repo/core` that dynamically fetches and mounts remotes.
- **EventBus**: A global communication channel for cross-MFE events and state syncing.
- **syncStore**: A utility to synchronize Zustand stores across different applications.

---

## 🛠️ Common Tasks

### Creating a New Micro-App

We have a built-in generator to scaffold new apps:

```bash
pnpm create-app
```

Follow the prompts to select your framework and name your app.

- Pick your framework (React, Vue, Svelte, or SolidJS).

### Registering a New App in the Shell

1.  Add the new app's port in `packages/config/src/ports.ts`.
2.  Update `apps/shell/vite.config.ts` (if using static federation) or dynamic registration in the Shell's routing.
3.  Create a route in `apps/shell/app/routes/` to host the new app.

### Shared UI Components

When creating a component for the design system:

```bash
cd packages/ui
pnpm generate
```

This scaffolds the component, styles, and Storybook stories.

---

## 🧪 Testing & Standards

- **Linting**: `pnpm lint`
- **Type Checking**: `pnpm typecheck`
- **Storybook**: `pnpm storybook` (Port 6006)

**Code Style**:

- Use **Conventional Commits**.
- No `any` types in TypeScript.
- Follow the **Feature-based structure** for components.

---

## 🆘 Troubleshooting

- **"Module not found" error**: Usually caused by a missing dependency in the `shared` config of Module Federation. Check `packages/config/src/shared-deps.ts`.
- **HMR not working**: Ensure ports are correctly configured and no conflicts exist.
- **State not syncing**: Verify both apps are using the same `syncStore` key and the same version of `@repo/core`.

---

## 🔗 Internal Documentation

- [Architecture Deep Dive](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Coding Standards](./STANDARDS.md)
