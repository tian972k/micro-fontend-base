# Orbit: Enterprise Micro-Frontend Platform

> **Production-ready, multi-framework micro-frontend architecture** optimized for scalability, performance, and developer experience.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444.svg)](https://turbo.build/)
[![Module Federation](https://img.shields.io/badge/Module_Federation-Vite-8B5CF6.svg)](https://github.com/originjs/vite-plugin-federation)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4.svg)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-8.0-F69220.svg)](https://pnpm.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**Hub-and-Spoke Architecture:** Like planets orbiting a sun, your micro-frontends (React, Vue, Svelte, SolidJS) revolve around a central Remix Shell, working in perfect harmony while maintaining independence.

```mermaid
graph TB
    subgraph "Browser Runtime"
        Shell["🏠 Shell (Remix SSR)<br/>:8000"]:::shell

        subgraph MFEs ["Micro-Frontends"]
            React["⚛️ React<br/>:8001"]:::react
            Next["▲ Next.js<br/>:8002"]:::next
            Vue["💚 Vue 3<br/>:8003"]:::vue
            Svelte["🔥 Svelte<br/>:8004"]:::svelte
            Solid["💎 SolidJS<br/>:8005"]:::solid
        end

        subgraph Shared ["Shared Layer"]
            Core["📦 @repo/core<br/>(State & Events)"]:::pkg
            UI["🎨 @repo/ui<br/>(Components)"]:::pkg
            Utils["🔧 @repo/utils<br/>(Helpers)"]:::pkg
        end
    end

    Shell -->|"Module Federation"| React
    Shell -->|"Module Federation"| Next
    Shell -->|"Module Federation"| Vue
    Shell -->|"Module Federation"| Svelte
    Shell -->|"Module Federation"| Solid

    React -.->|"imports"| Core
    React -.->|"imports"| UI
    React -.->|"imports"| Utils

    Vue -.->|"imports"| Core
    Vue -.->|"imports"| UI
    Svelte -.->|"imports"| Core
    Svelte -.->|"imports"| UI
    Solid -.->|"imports"| Core
    Solid -.->|"imports"| UI

    classDef shell fill:#22c55e,stroke:#16a34a,color:#fff
    classDef react fill:#61dafb,stroke:#0088cc,color:#000
    classDef next fill:#000,stroke:#333,color:#fff
    classDef vue fill:#42b883,stroke:#35495e,color:#fff
    classDef svelte fill:#ff3e00,stroke:#cc3200,color:#fff
    classDef solid fill:#2c4f7c,stroke:#1e3552,color:#fff
    classDef pkg fill:#8b5cf6,stroke:#6d28d9,color:#fff
```

---

## Documentation

### Core Guides

| Guide                                        | Description                                        |
| -------------------------------------------- | -------------------------------------------------- |
| [Getting Started](./docs/GETTING_STARTED.md) | Setup, Installation, and Running the Platform      |
| [Tutorial](./docs/TUTORIAL.md)               | Step-by-step guide to building your first MFE      |
| [Architecture](./docs/ARCHITECTURE.md)       | System design, Module Federation, State Management |
| [Standards](./docs/STANDARDS.md)             | Code style, Naming conventions, Best practices     |
| [Deployment](./docs/DEPLOYMENT.md)           | CI/CD, Docker strategies, Production setup         |
| [📊 Visual Guide](./docs/VISUAL_GUIDE.md)    | **Comprehensive diagrams & architecture visuals**  |

### Additional Resources

| Guide                                        | Description                                      |
| -------------------------------------------- | ------------------------------------------------ |
| [Contributing](./CONTRIBUTING.md)            | Development workflow, PR guidelines, Code review |
| [Troubleshooting](./docs/TROUBLESHOOTING.md) | Common issues and solutions                      |
| [Scripts Reference](./docs/SCRIPTS.md)       | Documentation for all automation scripts         |
| [Performance](./docs/PERFORMANCE.md)         | Optimization strategies and best practices       |
| [Security](./SECURITY.md)                    | Security guidelines and vulnerability reporting  |
| [CI/CD Reference](./docs/CI_CD_REFERENCE.md) | Pipeline optimization and technologies           |

---

## Key Features

### Multi-Framework Support

Build with **React, Vue, Svelte, SolidJS, or Next.js**. Each micro-frontend can use its optimal framework while sharing state and UI components seamlessly.

| Framework | Status | UI Components | State Management |
| --------- | :----: | :-----------: | :--------------: |
| React     |   ✅   |      ✅       |        ✅        |
| Vue 3     |   ✅   |      ✅       |        ✅        |
| Svelte    |   ✅   |      ✅       |        ✅        |
| SolidJS   |   ✅   |      ✅       |        ✅        |
| Next.js   |   ✅   |      ✅       |        ✅        |

### Lightning-Fast Development

- **Vite-powered** builds (< 2s for most apps)
- **Turborepo caching** - never rebuild the same code twice
- **Hot Module Replacement** across all frameworks
- **Parallel builds** with intelligent dependency graph

### Optimized Bundle Sizes

- **Tree-shaking enabled** with proper `sideEffects` configuration
- **Framework-specific builds** - No React in Vue apps
- **~550KB+ savings** per non-React app
- **Shared dependencies** managed centrally

### Smart CI/CD Pipeline

- **Change Detection** - Only build what changed
- **Conditional Docker** - Skip unchanged apps
- **~70% faster builds** on average
- **Parallel deployments**

### Multi-Framework UI Library

- **Consistent design system** across all frameworks
- **Shared variants** using CVA (Class Variance Authority)
- **Storybook** for each framework
- **Dark mode ready**

---

## Quick Start

```mermaid
flowchart LR
    A[📥 Clone Repo] --> B[📦 pnpm install]
    B --> C[⚙️ Setup .env]
    C --> D[🚀 pnpm dev]
    D --> E[🌐 localhost:8000]

    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style B fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style C fill:#eab308,stroke:#ca8a04,color:#000
    style D fill:#22c55e,stroke:#16a34a,color:#fff
    style E fill:#ec4899,stroke:#db2777,color:#fff
```

### Prerequisites

| Tool    | Version | Check           | Install                            |
| ------- | ------- | --------------- | ---------------------------------- |
| Node.js | v18+    | `node -v`       | [nodejs.org](https://nodejs.org)   |
| pnpm    | v8+     | `pnpm -v`       | `npm i -g pnpm`                    |
| Git     | Latest  | `git --version` | [git-scm.com](https://git-scm.com) |

### Installation

```bash
# 1️⃣ Clone repository
git clone <repository-url>
cd micro-frontend-base

# 2️⃣ Install dependencies
pnpm install

# 3️⃣ Setup environment
bash scripts/onboard.sh

# 4️⃣ Start development
pnpm dev
```

**✨ Open [http://localhost:8000](http://localhost:8000)**

---

## 📁 Project Structure Overview

```mermaid
graph TB
    subgraph Monorepo ["🌟 Orbit Monorepo"]
        subgraph Apps ["apps/ - Applications"]
            Shell[🏠 shell<br/>Remix SSR]:::app
            React[⚛️ app-react<br/>Vite + React]:::app
            Next["▲ app-nextjs<br/>Next.js"]:::app
            Vue["💚 app-vue<br/>Vite + Vue 3"]:::app
            Svelte["🔥 app-svelte<br/>Vite + Svelte"]:::app
            Solid["💎 app-solidjs<br/>Vite + Solid"]:::app
        end

        subgraph Packages ["packages/ - Shared Code"]
            Core[💡 core<br/>State & Events]:::pkg
            UI[🎨 ui<br/>Components]:::pkg
            Utils[🔧 utils<br/>Helpers]:::pkg
            Config[⚙️ config<br/>Configs]:::pkg
        end

        subgraph Tooling ["Infrastructure"]
            Scripts[📦 scripts/<br/>Automation]:::tool
            Docs[📝 docs/<br/>Documentation]:::tool
            CI[🔄 .github/<br/>CI/CD]:::tool
        end
    end

    Shell & React & Next & Vue & Svelte & Solid -.->|"depends on"| Core & UI & Utils
    Core & UI -.->|"uses"| Config
    Scripts -.->|"builds"| Apps
    Scripts -.->|"builds"| Packages
    CI -.->|"automates"| Scripts

    classDef app fill:#22c55e,stroke:#16a34a,color:#fff
    classDef pkg fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef tool fill:#3b82f6,stroke:#2563eb,color:#fff
```

---

## Development Workflow

```mermaid
stateDiagram-v2
    [*] --> Setup: pnpm install
    Setup --> Dev: pnpm dev

    state Dev {
        [*] --> EditCode
        EditCode --> HMR: Save File
        HMR --> Preview: Hot Reload
        Preview --> EditCode: Continue
    }

    Dev --> Test: pnpm test
    Test --> Lint: pnpm lint
    Lint --> Build: pnpm build
    Build --> Deploy: pnpm docker:build:smart
    Deploy --> [*]

    Test --> Dev: Fix Issues
    Lint --> Dev: Fix Issues
    Build --> Dev: Fix Issues
```

---

## Common Commands

### Development

| Command          | Description                     |
| :--------------- | :------------------------------ |
| `pnpm dev`       | Start all apps (Shell + MFEs)   |
| `pnpm dev:shell` | Start only the Shell            |
| `pnpm dev:mfes`  | Start only MFE apps             |
| `pnpm storybook` | Run Storybook for UI components |
| `pnpm cli`       | Interactive CLI for scaffolding |

### Build & Deploy

| Command                   | Description                       |
| :------------------------ | :-------------------------------- |
| `pnpm build`              | Build all packages and apps       |
| `pnpm build:mfes`         | Build all MFE apps                |
| `pnpm build:mfes:prod`    | Production build for MFEs         |
| `pnpm docker:build:smart` | Smart Docker build (changed only) |

### Quality & Validation

| Command                    | Description                  |
| :------------------------- | :--------------------------- |
| `pnpm lint`                | Run ESLint                   |
| `pnpm type-check`          | TypeScript type checking     |
| `pnpm validate:mfe-config` | Check MFE configuration      |
| `pnpm validate:app-ids`    | Validate APP_IDS consistency |
| `pnpm test`                | Run all tests                |

---

## Detailed Directory Structure

```text
micro-frontend-base/
├── apps/
│   ├── shell/           # Remix host application (SSR)
│   ├── app-react/       # React micro-frontend
│   ├── app-nextjs/      # Next.js micro-frontend
│   ├── app-vue/         # Vue 3 micro-frontend
│   ├── app-svelte/      # Svelte micro-frontend
│   └── app-solidjs/     # SolidJS micro-frontend
│
├── packages/
│   ├── ui/              # Multi-framework design system
│   ├── core/            # State management & MFE utilities
│   ├── utils/           # Helper functions
│   └── config/          # Shared configurations
│
├── scripts/
│   ├── mfe.config.mjs   # Central MFE configuration
│   ├── cli.mjs          # Interactive CLI
│   ├── create-app.mjs   # App scaffolding
│   └── ...              # Build & utility scripts
│
└── docs/                # Documentation
```

---

## UI Component Library

Our multi-framework UI library provides consistent components across all frameworks:

```tsx
// React
import { Button, Card } from "@repo/ui/react";

// Vue
import { Button, Card } from "@repo/ui/vue";

// Svelte
import { Button, Card } from "@repo/ui/svelte";

// SolidJS
import { Button, Card } from "@repo/ui/solid";
```

### Available Components

| Component | React | Vue | Solid | Svelte |
| --------- | :---: | :-: | :---: | :----: |
| Button    |  ✅   | ✅  |  ✅   |   ✅   |
| Card      |  ✅   | ✅  |  ✅   |   ✅   |
| Input     |  ✅   | ✅  |  ✅   |   ✅   |
| Avatar    |  ✅   | ✅  |  ✅   |   ✅   |
| Tooltip   |  ✅   | ✅  |  ✅   |   ✅   |
| Sheet     |  ✅   | 🔜  |  🔜   |   🔜   |
| Dropdown  |  ✅   | 🔜  |  🔜   |   🔜   |
| Sidebar   |  ✅   | 🔜  |  🔜   |   🔜   |

### Run Storybook

```bash
# All frameworks
pnpm storybook:all

# Individual frameworks
pnpm storybook:react   # Port 6006
pnpm storybook:vue     # Port 6007
pnpm storybook:solid   # Port 6008
pnpm storybook:svelte  # Port 6009
```

---

## MFE Configuration

All MFE apps are configured centrally in `scripts/mfe.config.mjs`:

```javascript
export const MFE_APPS = [
  {
    name: "app-react",
    framework: "react",
    port: 8001,
    entryFile: "entry-mfe.tsx",
    outputDir: "dist",
  },
  // Add new apps here...
];
```

### Add a New MFE

1. **Use the CLI:**

```bash
pnpm cli
# Select: 1. create-app
```

1. **Add to config:**

```javascript
// scripts/mfe.config.mjs
{
  name: 'app-my-dashboard',
  framework: 'react',
  port: 8006,
  entryFile: 'entry-mfe.tsx',
  outputDir: 'dist',
}
```

1. **Start development:**

```bash
pnpm dev --filter=app-my-dashboard
```

---

## 🐳 Docker Deployment

### Development

```bash
# Start all services
docker-compose up --build

# Start specific services
docker-compose up shell app-react app-vue
```

### Production

```bash
# Smart build (only changed apps)
EXECUTE=true pnpm docker:build:smart

# Force build all
FORCE_ALL=true EXECUTE=true node scripts/smart-docker-build.js
```

---

## Architecture Overview

```mermaid
flowchart TD
    User["End User"] -->|Request| Shell["Shell (Remix SSR)"]

    subgraph "Browser Runtime"
        Shell -->|Mount| React["React MFE"]
        Shell -->|Mount| Vue["Vue MFE"]
        Shell -->|Mount| Svelte["Svelte MFE"]
        Shell -->|Mount| Solid["Solid MFE"]
    end

    subgraph "Shared Layer"
        Core["@repo/core"]
        UI["@repo/ui"]
    end

    React & Vue & Svelte & Solid --> Core
    React --> UI
```

See [Architecture Guide](./docs/ARCHITECTURE.md) for detailed documentation.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

See [Standards](./docs/STANDARDS.md) for coding conventions.

---

## Support

- Read the [Documentation](./docs/)
- Report issues on GitHub
- Contact: [phamtuandev0907@gmail.com](mailto:phamtuandev0907@gmail.com)

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Built with ❤️ using <a href="https://turbo.build/">Turborepo</a>, <a href="https://vitejs.dev/">Vite</a>, and <a href="https://remix.run/">Remix</a>
</p>
