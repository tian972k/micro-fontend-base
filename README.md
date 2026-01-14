# Micro-Frontend Base Platform

A production-ready Micro-Frontend foundation using **Turborepo**, **Remix** (App Shell), and **Vite** (Micro Apps).

## 🚀 Key Features

- **⚡ Monorepo**: High-performance pipeline powered by [Turborepo](https://turbo.build/) & pnpm.
- **🏗️ App Shell**: Built with [Remix](https://remix.run/), handling SSR, routing, and shared layout.
- **🏝️ Micro Apps**: Autonomous [Vite](https://vitejs.dev/) React SPAs loaded as client-side islands.
- **🎨 Shared UI**: [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS as the unified design system.
- **🛰️ Communication**: Event-based bus for decoupled cross-app coordination.
- **🛡️ Resilience**: Built-in health checks and graceful fallbacks.

## 📖 Essential Documentation

- **[Onboarding Guide](./docs/ONBOARDING.md) 👈 Start Here**
- [Project Structure & File Guide](./docs/PROJECT_STRUCTURE.md)
- [Architecture Deep Dive](./docs/ARCHITECTURE.md)
- [Deployment Strategy](./docs/DEPLOYMENT.md)
- [Conventions & Standards](./docs/CONVENTIONS.md)

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
   - App B: <http://localhost:8002>

   > [!IMPORTANT]
   > **Note on Micro-Frontends in Development**:
   > The App Shell loads MFEs via `manifest.json` and static entry files.
   > Standard dev servers (like `vite dev` or `next dev`) often do not output these static assets to the expected URL paths by default.
   >
   > To ensure MFEs load correctly in the Shell during development:
   > 1. **Ensure the MFE is built**: Run `pnpm build:mfe` (or `pnpm build` for App A) so the static assets exist.
   > 2. **Or configure your dev server**: Ensure it mimics the production asset paths (e.g. `server.origin` in Vite).

### 4. Create New App

```bash
pnpm create-app
```

Follow the prompts to generate a new Micro-Frontend based on the template.

## 🏗️ Architecture

- **Routing**: The Shell owns all routes.
- **Mounting**: Micro-apps are mounted into specific DOM nodes via `entry-mfe.tsx` which exposes `mount` and `unmount`.
- **Discovery**: The Shell checks `health.json` and loads `manifest.json` from the Micro-App's host URL to dynamically inject scripts.

## 📝 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Project Structure](./docs/PROJECT_STRUCTURE.md)
- [Deployment Strategy](./docs/DEPLOYMENT.md)
- [Conventions & Standards](./docs/CONVENTIONS.md)
- [Guardrails & Anti-Patterns](./docs/GUARDRAILS.md)
- [Onboarding Guide](./docs/ONBOARDING.md)
