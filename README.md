# Micro-Front-End Base Platform

Production-ready micro-front-end platform using **Module Federation**, **Turborepo**, and **Vite**.

> 📚 **Full Documentation**: [docs/README.md](./docs/README.md)

## Quick Start

```bash
# Install
pnpm install

# Run all apps
pnpm dev

# Run specific app
pnpm dev:shell   # Port 8000
pnpm dev:a       # Port 8001
pnpm dev:b       # Port 8002
```

## Architecture

**Module Federation** platform with framework-agnostic micro-front-ends:

- **Shell** (Remix) - Host application
- **App A** (React) - Remote MFE
- **App B** (Next.js) - Remote MFE
- **App C** (Vue) - Remote MFE
- **App D** (Svelte) - Remote MFE

**Shared Packages**:

- `@repo/core` - State management, MFE utilities
- `@repo/ui` - Design system components
- `@repo/utils` - Helper functions
- `@repo/config` - Shared configs

## Development

### Create New App

```bash
pnpm create-app
```

Scaffold new micro-front-end with framework selection (React/Vue/Svelte).

### Generate UI Component

```bash
cd packages/ui && pnpm generate
```

Create component with Storybook story for React/Vue/Svelte.

### Storybook

```bash
pnpm storybook
```

View components at <http://localhost:6006>

## Tech Stack

- **Monorepo**: Turborepo + pnpm
- **Build**: Vite 5
- **Module Federation**: @originjs/vite-plugin-federation
- **State**: Zustand (vanilla + React hooks)
- **UI**: Tailwind CSS + shadcn/ui
- **TypeScript**: Strict mode

## Documentation

- [Complete Guide](./docs/README.md) - Setup, architecture, deployment
- [Architecture](./docs/ARCHITECTURE.md) - System design
- [Standards](./docs/STANDARDS.md) - Code quality
- [Conventions](./docs/CONVENTIONS.md) - Naming, commits
- [Deployment](./docs/DEPLOYMENT.md) - Production setup

## License

MIT
