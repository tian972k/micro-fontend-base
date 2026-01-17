# 🚀 Getting Started Guide

Welcome to the Micro-Front-End Base Platform! This guide will help you understand and use the project effectively.

---

## 📚 Documentation Hub

All documentation is organized in the [docs/](./docs/) folder. Start here:

### 🎯 **[Documentation Index](./README.md)** ⭐

Complete navigation guide to all documentation, categorized by:

- **New Team Members** - Onboarding and project structure
- **Developers** - Standards, conventions, tools
- **Architects** - System design and technical decisions
- **DevOps** - Deployment and operations

---

## ⚡ Quick Commands

### Development

```bash
# Run all apps (Shell + all MFEs)
pnpm dev

# Run specific apps
pnpm dev:shell   # Shell only (port 8000)
pnpm dev:a       # App A (port 8001)
pnpm dev:b       # App B (port 8002)

# Build everything
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format

# Lint markdown
pnpm lint:md
pnpm lint:md:fix  # Auto-fix
```

### UI Development

```bash
# Run Storybook
pnpm storybook

# Generate new UI component (React/Vue/Svelte)
pnpm --filter @repo/ui generate
```

### Project Tools

```bash
# Create new micro-front-end app
pnpm create-app

# Generate UI component (React only, deprecated)
pnpm generate-ui
```

---

## 🏭️ Creating a New Micro-Front-End

See detailed guide: [Create App Guide](./tools/CREATE_APP_GUIDE.md)

**Quick Start:**

```bash
pnpm create-app
```

Interactive prompts will guide you through:

1. Choose app name (kebab-case)
2. Select framework (React/Vue/Svelte)
3. Auto-configuration of all settings

**What it creates:**

- Complete app structure from template
- Updates root package.json with dev script
- Configures Module Federation manifest
- Sets up all necessary config files

**Next steps after creation:**

1. `pnpm install` - Install dependencies
2. Update port in `vite.config.ts` if needed
3. Register remote in Shell's `remotes.config.ts`
4. `pnpm dev:your-app` - Run your new app

---

## 🎨 Creating UI Components

See detailed guide: [UI Generator Guide](./tools/UI_GENERATOR.md)

**Quick Start:**

```bash
cd packages/ui
pnpm generate
# or: pnpm g
```

**Features:**

- Multi-framework support (React/Vue/Svelte)
- Auto-generates component + Storybook story
- TypeScript support
- Variant system included
- Auto-export for React

---

## 📖 Essential Reading

### For New Team Members

1. [Onboarding Guide](./docs/ONBOARDING.md) - Your first day
2. [Project Structure](./docs/PROJECT_STRUCTURE.md) - Code organization
3. [Conventions](./docs/CONVENTIONS.md) - How we write code

### For Development

1. [Standards](./docs/STANDARDS.md) - Code quality guidelines
2. [Architecture](./docs/ARCHITECTURE.md) - System design
3. [MFE Lifecycle](./docs/MFE_LIFECYCLE.md) - How micro-front-ends work
4. [State Sync](./docs/STATE_SYNC.md) - Cross-app state management

### For Deployment

1. [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment
2. [Clone Guide](./docs/CLONE_GUIDE.md) - Create new projects

---

## 🛠️ Tech Stack

### Core Technologies

- **Monorepo**: Turborepo + pnpm workspaces
- **Build**: Vite 5
- **Module Federation**: @originjs/vite-plugin-federation
- **TypeScript**: Strict mode enabled

### Frameworks

- **Shell (Host)**: Remix 2 + React 18
- **App A**: React 18 + Vite
- **App B**: Next.js 14 + Vite (Hybrid)
- **App C**: Vue 3 + Vite
- **App D**: Svelte 4 + Vite

### Shared Libraries

- **@repo/ui**: Design system (shadcn/ui based)
- **@repo/core**: State management, MFE utilities
- **@repo/utils**: Shared utilities
- **@repo/config**: Shared configurations

### Development Tools

- **Storybook**: v10.1.11 (ESM-only)
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Markdownlint**: Documentation quality
- **Husky**: Git hooks
- **lint-staged**: Pre-commit checks

---

## 📁 Project Structure

```text
├── apps/                    # Micro-front-end applications
│   ├── shell/              # Host application (Remix)
│   ├── app-a/              # React MFE
│   ├── app-b/              # Next.js MFE
│   ├── app-c/              # Vue MFE
│   └── app-d/              # Svelte MFE
├── packages/               # Shared packages
│   ├── core/              # State & MFE utilities
│   ├── ui/                # Design system
│   ├── utils/             # Shared helpers
│   └── config/            # Shared configs
├── docs/                  # Documentation
│   ├── README.md          # Documentation index ⭐
│   ├── ONBOARDING.md      # Getting started
│   └── ...                # More guides
├── scripts/               # CLI tools
│   ├── create-app.mjs     # App generator
│   └── generate-ui.mjs    # UI generator
└── package.json           # Root workspace config
```

---

## 🎯 Common Tasks

### I want to

**...understand the system**
→ Read [Architecture](./docs/ARCHITECTURE.md) and [MFE Lifecycle](./docs/MFE_LIFECYCLE.md)

**...start developing**
→ Follow [Onboarding](./docs/ONBOARDING.md) → [Project Structure](./docs/PROJECT_STRUCTURE.md)

**...create a new app**
→ Run `pnpm create-app` (see [Create App Guide](./tools/CREATE_APP_GUIDE.md))

**...create a UI component**
→ Run `pnpm --filter @repo/ui generate` (see [UI Generator](./tools/UI_GENERATOR.md))

**...share state between apps**
→ Read [State Sync Guide](./docs/STATE_SYNC.md)

**...deploy to production**
→ Follow [Deployment Guide](./docs/DEPLOYMENT.md)

**...add internationalization**
→ Check [i18n Strategy](./docs/I18N_STRATEGY.md)

---

## 🔗 Quick Links

- **[Documentation Index](./docs/README.md)** - All docs organized
- **[Full README](./README.md)** - Complete project overview
- **[Storybook](http://localhost:6006)** - UI component library
- **[Create App Guide](./tools/CREATE_APP_GUIDE.md)** - Scaffold new apps
- **[UI Generator](./tools/UI_GENERATOR.md)** - Create components

---

## 💡 Tips

1. **Always check docs first** - Most answers are documented
2. **Use the CLI tools** - Don't create apps/components manually
3. **Follow conventions** - Consistency matters in a monorepo
4. **Run lint before commit** - Git hooks will enforce this
5. **Keep docs updated** - Update docs when you change code

---

## 🆘 Need Help?

1. Check [Documentation Index](./docs/README.md)
2. Search existing docs for your topic
3. Review [Common Tasks](#-common-tasks) section
4. Ask the team if still unclear

---

**Happy coding!** 🚀
