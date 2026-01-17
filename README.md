# 🚀 Enterprise Micro-Frontend Platform

> **Production-ready, multi-framework micro-frontend architecture** optimized for scalability, performance, and developer experience.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-red.svg)](https://turbo.build/)
[![Module Federation](https://img.shields.io/badge/Module_Federation-Vite-purple.svg)](https://github.com/originjs/vite-plugin-federation)

---

## 🌟 Key Features

### ✨ Multi-Framework Support

Build with **React, Vue, Svelte, SolidJS, or Next.js** - all in one platform! Each micro-frontend can use its optimal framework while sharing state and UI components seamlessly.

### 🎯 Optimized Bundle Sizes

- **Tree-shaking enabled** with proper `sideEffects` configuration
- **Framework-specific builds** - No React in Vue apps, no Vue in React apps
- **~550KB+ savings** per non-React app through intelligent dependency management
- Only bundle what you actually use

### ⚡ Lightning-Fast Development

- **Vite-powered** builds (< 2s for most apps)
- **Hot Module Replacement (HMR)** across all frameworks
- **Turborepo caching** - Never rebuild the same code twice
- **Parallel builds** - Build all 6 apps in ~13s

### 🏗️ Production-Grade Architecture

- **Module Federation** for runtime integration
- **SSR-ready** with Remix shell application
- **Health checks** and graceful fallbacks
- **Docker-optimized** smart build system
- **Zero-downtime** independent deployments

### 🎨 Premium Design System

- **Component library** with React/Vue/Svelte variants
- **Storybook** documentation (auto-generated)
- **Tailwind CSS** + shadcn/ui components
- **Dark mode** support out of the box

### 🔧 Developer Experience

- **Type-safe** with strict TypeScript
- **Auto-scaffolding** - Create new apps in 30 seconds
- **Component generator** with Storybook integration
- **Interactive CLI** for common tasks
- **Comprehensive docs** with diagrams and examples

---

## 📊 Architecture Overview

```mermaid
graph TD
    subgraph "Host Application (Remix SSR)"
        Shell[Shell App]:::host
    end

    subgraph "Micro-Frontends (Runtime Integration)"
        React[App React]:::react
        Next[App Next.js]:::next
        Vue[App Vue]:::vue
        Svelte[App Svelte]:::svelte
        Solid[App SolidJS]:::solid
        Others[...]:::others
    end

    subgraph "Shared Infrastructure"
        Core[@repo/core]:::shared
        UI[@repo/ui]:::shared
        Utils[@repo/utils]:::shared
    end

    Shell --> React
    Shell --> Next
    Shell --> Vue
    Shell --> Svelte
    Shell --> Solid
    Shell --> Others

    React --> Core & UI
    Next --> Core & UI
    Vue --> Core & UI
    Svelte --> Core & UI
    Solid --> Core & UI & Utils

    classDef host fill:#6366f1,color:#fff,stroke:#4338ca,stroke-width:2px
    classDef react fill:#61dafb,color:#000,stroke:#2da6cc,stroke-width:2px
    classDef next fill:#000000,color:#fff,stroke:#333,stroke-width:2px
    classDef vue fill:#42b883,color:#fff,stroke:#35495e,stroke-width:2px
    classDef svelte fill:#ff3e00,color:#fff,stroke:#cc3200,stroke-width:2px
    classDef solid fill:#2c4f7c,color:#fff,stroke:#1e3552,stroke-width:2px
    classDef others fill:#eee,color:#333,stroke:#bbb,stroke-width:2px,stroke-dasharray: 5 5
    classDef shared fill:#f9f9f9,color:#333,stroke:#ddd,stroke-width:2px
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.0

### Installation

```bash
# Clone repository
git clone <repository-url>
cd micro-frontend-base

# Install dependencies
pnpm install

# Setup Environment
cp .env.example .env

# Start all apps in development mode
pnpm dev

# Or use interactive CLI (recommended)
pnpm cli
```

### Access Points

- **Shell**: http://localhost:8000
- **Storybook**: http://localhost:6006
- **React App**: http://localhost:8001
- **Next.js App**: http://localhost:8002
- **Vue App**: http://localhost:8003
- **Svelte App**: http://localhost:8004
- **SolidJS App**: http://localhost:8005

---

## 📦 Project Structure

```
micro-frontend-base/
├── apps/
│   ├── shell/              # Remix host application (SSR)
│   ├── app-react/          # React micro-frontend
│   ├── app-nextjs/         # Next.js micro-frontend
│   ├── app-vue/            # Vue 3 micro-frontend
│   ├── app-svelte/         # Svelte micro-frontend
│   └── app-solidjs/        # SolidJS micro-frontend
├── packages/
│   ├── ui/                 # Design system & components
│   ├── core/               # State management & MFE utilities
│   ├── utils/              # Helper functions
│   └── config/             # Shared configurations
├── docs/                   # Comprehensive documentation
└── scripts/                # Automation & tooling
```

---

## 🎯 Core Capabilities

### 1. Framework-Agnostic State Management

Share state across **any framework** using Zustand vanilla store:

```typescript
// Create store (framework-agnostic)
const userStore = createVanillaStore({ name: 'John' });

// Use in React
const UserProfile = () => {
  const name = useStore(userStore, state => state.name);
  return <div>{name}</div>;
};

// Use in Vue
const name = computed(() => userStore.getState().name);

// Use in Svelte
$: name = $userStore.name;
```

### 2. Optimized Federation Config

Apps only bundle what they need:

```typescript
// React apps - Get full shared deps
shared: [...baseShared, ...reactShared];
// → react, react-dom, @repo/ui, @repo/core

// Non-React apps - Lean config
shared: [...nonReactShared];
// → Only @repo/core, @repo/utils, dayjs
// ✅ No React (saves ~260KB)
```

### 3. Smart Scaffolding

Create new micro-frontend in **30 seconds**:

```bash
pnpm create-app

# Select framework: React | Vue | Svelte | SolidJS
# Auto-configured: Vite, Federation, Docker, TypeScript
# Ready to develop!
```

### 4. Health Checks & Graceful Degradation

```typescript
<MfeHost name="app-react" host="http://localhost:8001" />
```

- ✅ Automatic health checks
- ✅ Maintenance mode UI
- ✅ Error boundaries with retry
- ✅ Loading states

---

## 🏆 Performance Metrics

### Build Times

| Task                | Time  | Cache Hit |
| ------------------- | ----- | --------- |
| Full Build (6 apps) | ~13s  | ~5s       |
| Single App          | ~2-4s | instant   |
| Storybook           | ~5s   | ~2s       |

### Bundle Sizes (Production)

| App         | Size       | Optimizations         |
| ----------- | ---------- | --------------------- |
| **Shell**   | ~720KB     | SSR + Code splitting  |
| **React**   | ~720KB     | React + UI components |
| **SolidJS** | **872KB**  | ✅ No React deps      |
| **Vue**     | **560KB**  | ✅ No React deps      |
| **Svelte**  | **~550KB** | ✅ Minimal bundle     |

**Optimization highlights:**

- ✅ Removed 547KB lodash (unused)
- ✅ Removed ~260KB React from non-React apps
- ✅ Tree-shaking with `sideEffects`
- ✅ Framework-specific shared configs

---

## 🛠️ Development Workflow

### Daily Development

```bash
# Start everything
pnpm dev

# Work on specific app
pnpm dev:shell
pnpm dev:a      # app-react
pnpm dev:b      # app-vue

# View design system
pnpm storybook

# Build all
pnpm build

# Format code
pnpm format

# Lint
pnpm lint
```

### Creating Features

```bash
# 1. Generate UI component
cd packages/ui
pnpm generate
# → Creates component + Storybook story

# 2. Create new micro-frontend
pnpm create-app
# → Full app scaffold with best practices

# 3. Add to shared packages
# → Edit packages/core or packages/utils
```

---

## 📚 Documentation

| Document                                              | Description                     |
| ----------------------------------------------------- | ------------------------------- |
| [🚀 Onboarding Guide](./docs/ONBOARDING.md)           | New developer quickstart        |
| [🧠 Technical Overview](./docs/TECHNICAL_OVERVIEW.md) | Architecture & design decisions |
| [🏗️ Architecture](./docs/ARCHITECTURE.md)             | System design patterns          |
| [🛠️ Tooling & Scripts](./docs/TOOLING.md)             | Automation & CLI tools          |
| [📋 Standards](./docs/STANDARDS.md)                   | Code quality guidelines         |
| [📝 Conventions](./docs/CONVENTIONS.md)               | Naming & commit standards       |
| [🚢 Deployment](./docs/DEPLOYMENT.md)                 | Production deployment guide     |

---

## 🎨 Component Library

Premium UI components with **multiple framework support**:

```tsx
// React
import { Button, Card } from "@repo/ui";
<Button variant="primary">Click me</Button>;

// Vue
import { Button, Card } from "@repo/ui";
<Button variant="primary">Click me</Button>;

// Svelte
import { Button, Card } from "@repo/ui";
<Button variant="primary">Click me</Button>;
```

**Included components:**

- Button, Card, Input, Avatar
- Dropdown Menu, Tooltip, Sheet
- Sidebar, Skeleton, Separator
- Collapsible panels
- **All with dark mode support**

View in Storybook: `pnpm storybook`

---

## 🔐 Security & Best Practices

- ✅ **Strict TypeScript** - Type safety across all apps
- ✅ **ESLint + Prettier** - Automated code quality
- ✅ **Git Hooks** - Pre-commit validation (Husky)
- ✅ **Dependency audit** - pnpm audit on CI
- ✅ **CSP headers** - Content Security Policy ready
- ✅ **CORS configuration** - Secure cross-origin requests

---

## 🚢 Deployment

### Docker Support

Each micro-frontend has optimized Docker builds:

```bash
# Build single MFE
docker build -f Dockerfile.mfe --build-arg APP_NAME=app-react .

# Smart build (only changed apps)
node scripts/smart-docker-build.js
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Health check endpoints verified
- [ ] CDN for static assets
- [ ] Monitoring & logging setup
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete guide.

---

## 🤝 Contributing

### Adding a New Micro-Frontend

```bash
# 1. Run scaffolding tool
pnpm create-app

# 2. Select framework and configure
# 3. Develop your app in apps/<your-app>
# 4. Add to docker-compose.yml
# 5. Update documentation
```

### Code Standards

- Follow [Standards Guide](./docs/STANDARDS.md)
- Use [Conventional Commits](./docs/CONVENTIONS.md)
- Write tests for shared packages
- Update Storybook for UI changes

---

## 🧪 Tech Stack

### Core Technologies

- **Monorepo**: Turborepo + pnpm workspaces
- **Build Tool**: Vite 5.x
- **Module Federation**: @originjs/vite-plugin-federation
- **TypeScript**: Strict mode, shared configs

### Frameworks

- **React** 18.3 + React Router
- **Next.js** 14.x (App Router)
- **Vue** 3.4 (Composition API)
- **Svelte** 4.x
- **SolidJS** 1.x
- **Remix** 2.x (Shell)

### State & Styling

- **State Management**: Zustand (vanilla + hooks)
- **Styling**: Tailwind CSS 3.x
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React + Phosphor Icons

### Quality & Tooling

- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged
- **Documentation**: Storybook 10.x
- **Testing**: (Add your preferred framework)

---

## 📈 Roadmap

- [ ] **Testing setup** - Vitest + Testing Library
- [ ] **E2E tests** - Playwright
- [ ] **CI/CD pipeline** - GitHub Actions
- [ ] **Monitoring** - OpenTelemetry integration
- [ ] **Sub-path exports** - Granular UI imports
- [ ] **Micro-frontend analytics** - Usage tracking
- [ ] **Performance budgets** - Bundle size limits

---

## 💡 Why This Architecture?

### For Engineering Teams

- ✅ **Independent deployments** - Deploy apps without coordinating
- ✅ **Team autonomy** - Each team owns their micro-frontend
- ✅ **Technology flexibility** - Choose the best framework per use case
- ✅ **Incremental adoption** - Migrate piece by piece
- ✅ **Reduced blast radius** - Bugs contained to single app

### For Business

- ✅ **Faster time-to-market** - Parallel development
- ✅ **Lower risk** - Smaller, isolated changes
- ✅ **Scalability** - Add teams/features without slowdown
- ✅ **Future-proof** - Easy to adopt new frameworks
- ✅ **Cost efficient** - Optimal bundle sizes

---

## 📞 Support

### Getting Help

- 📖 Read the [Documentation](./docs/)
- 🐛 Report issues on GitHub
- 💬 Contact the platform team

### FAQ

**Q: Can I use a different framework?**  
A: Yes! Use `pnpm create-app` and modify the template. Our federation setup supports any framework.

**Q: How do I share data between apps?**  
A: Use Zustand vanilla stores in `@repo/core`. See [TECHNICAL_OVERVIEW.md](./docs/TECHNICAL_OVERVIEW.md).

**Q: What about SEO?**  
A: The Remix shell provides SSR. Individual MFEs can also implement SSR if needed.

**Q: How do I optimize bundle size further?**  
A: See our [bundle optimization guide](./docs/TECHNICAL_OVERVIEW.md#bundle-optimization) - we achieved ~550KB savings per app!

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🙏 Acknowledgments

Built with best practices from:

- [Module Federation Examples](https://github.com/module-federation/module-federation-examples)
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [shadcn/ui](https://ui.shadcn.com/)
- Enterprise micro-frontend architectures

---

<div align="center">
  
**[⭐ Star this repo](https://github.com/your-org/micro-frontend-base)** if you find it useful!

Built with ❤️ for enterprise-grade applications

</div>
