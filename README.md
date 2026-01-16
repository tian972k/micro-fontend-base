# Micro-Frontend Base Platform

A production-ready Micro-Frontend foundation using **Turborepo**, **Remix** (App Shell), and **Vite** (Micro Apps).

## 🚀 Key Features

- **⚡ Monorepo**: High-performance pipeline powered by [Turborepo](https://turbo.build/) & pnpm.
- **🏗️ App Shell**: Built with [Remix](https://remix.run/), handling SSR, routing, and shared layout.
- **🏝️ Micro Apps**: Autonomous [Vite](https://vitejs.dev/) React SPAs loaded as client-side islands.
- **🎨 Shared UI**: [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS as the unified design system.
- **🧠 Global State**: Centralized **Zustand** store for seamless User/Session sharing.
- **🛠️ Utilities**: Shared logic via `@repo/utils` (including Lodash) and `@repo/core`.
- **🛡️ Resilience**: Built-in health checks and graceful fallbacks.

## 🏗️ Architecture

```mermaid
graph TD
    User((User)) --> Shell[App Shell (Remix)]

    subgraph "Host Environment"
        Shell -->|Mounts| MFE_A[App A (Vite)]
        Shell -->|Mounts| MFE_B[App B (Vite)]
    end

    subgraph "Shared Packages"
        Core["@repo/core"]
        UI["@repo/ui"]
        Utils["@repo/utils"]
    end

    Shell --> Core
    Shell --> UI
    Shell --> Utils

    MFE_A --> Core
    MFE_A --> UI
    MFE_A --> Utils

    Core -->|Exposes| Store[Global User Store (Zustand)]
    Core -->|Exposes| EventBus[Event Bus]

    MFE_A -.->|Reads/Writes| Store
    Shell -.->|Reads/Writes| Store
```

### State Management

We use **Zustand** for global state shared across the Shell and Micro-Frontends.

- **Store Location**: `@repo/core/user-store`
- **Mechanism**: A singleton store instance attached to `window` (securely via Symbol) to ensure all independent bundles share the same state in memory.
- **Usage**:

  ```tsx
  import { useUserStore } from "@repo/core";

  const user = useUserStore((state) => state.user);
  ```

## 📖 Essential Documentation

- **[Onboarding Guide](./docs/ONBOARDING.md) 👈 Start Here**
- [Project Structure & File Guide](./docs/PROJECT_STRUCTURE.md)
- [Architecture Deep Dive](./docs/ARCHITECTURE.md)
- [Deployment Strategy](./docs/DEPLOYMENT.md)
- [Conventions & Standards](./docs/CONVENTIONS.md)

### 🚨 Routing Convention (Start Here)

We use `remix-custom-routes` for flexible routing.

- **Convention**: Any file ending in `*.route.tsx` inside `apps/shell/app/` (even deeply nested) is a route.
- **URL Mapping**: URLs are determined by the filename, with dots `.` replacing slashes `/`.
  - `dashboard.route.tsx` -> `/dashboard`
  - `dashboard.app-a.route.tsx` -> `/dashboard/app-a`
  - `users.profile.route.tsx` -> `/users/profile`

### 🚨 Coding Rules

1. **File Naming**: All filenames MUST be **kebab-case** (e.g. `app-sidebar.tsx`, `user-store.ts`).
2. **Components**: PascalCase.
3. **Aliases**: Use `@Repo/*` for workspaces and `@/*` for internal src imports.

## 🛠️ Quick Start

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Configure Environment**

   ```bash
   cp apps/shell/.env.example apps/shell/.env
   ```

3. **Run Development**
   ```bash
   pnpm dev
   ```

   - Shell: <http://localhost:8000>
   - App A: <http://localhost:8001>
