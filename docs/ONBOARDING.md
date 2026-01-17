# 🚀 Developer Onboarding Guide

Welcome to the **Micro-Front-End Base Platform**! This guide will help you get up and running, understand our architecture, and make your first contribution.

> **Visual Guide**: See [Technical Overview](./TECHNICAL_OVERVIEW.md) for architectural diagrams.

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

# Setup environment variables (Root config)
cp .env.example .env

# Setup Shell environment (optional, inherits from root if not present)
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

The platform uses a **Hub-and-Spoke** model.

```mermaid
graph LR
    User --> Shell[Shell (Remix)]
    Shell --> React[App React]
    Shell --> Vue[App Vue]
    Shell --> Svelte[App Svelte]
    Shell --> Solid[App Solid]
```

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

### Registering a New App in the Shell

1.  Add the new app's port in `.env` and `packages/config/src/env/ports.ts`.
2.  Update `apps/shell/vite.config.ts` (if using static federation).
3.  Create a route in `apps/shell/app/routes/`.

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

## 🔗 Internal Documentation

- [Architecture Deep Dive (Diagrams included)](./TECHNICAL_OVERVIEW.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Coding Standards](./STANDARDS.md)
