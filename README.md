# Orbit: Enterprise Micro-Frontend Platform

> **Production-ready, multi-framework micro-frontend architecture** optimized for scalability, performance, and developer experience.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444.svg)](https://turbo.build/)
[![Module Federation](https://img.shields.io/badge/Module_Federation-Vite-8B5CF6.svg)](https://github.com/originjs/vite-plugin-federation)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4.svg)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.5-F69220.svg)](https://pnpm.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**Hub-and-Spoke Architecture:** Like planets orbiting a sun, your micro-frontends (React, Vue, Svelte, SolidJS) revolve around a central Remix Shell, working in perfect harmony while maintaining independence.

```mermaid
graph TB
    subgraph Runtime ["Browser Runtime"]
        Shell["Shell<br/>Remix SSR :8000"]:::shell

        subgraph MFEs ["Micro-Frontends"]
            React["React :8001"]:::mfe
            Next["Next.js :8002"]:::mfe
            Vue["Vue 3 :8003"]:::mfe
            Svelte["Svelte :8004"]:::mfe
            Solid["SolidJS :8005"]:::mfe
        end

        subgraph Shared ["Shared Layer"]
            Core["core<br/>State & Events"]:::pkg
            UI["ui<br/>Components"]:::pkg
            Utils["utils<br/>Helpers"]:::pkg
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

    classDef shell fill:#10b981,stroke:#059669,color:#fff
    classDef mfe fill:#3b82f6,stroke:#2563eb,color:#fff
    classDef pkg fill:#8b5cf6,stroke:#7c3aed,color:#fff
```

---

## Documentation

- [docs/PACKAGE_SUMMARY.md](docs/PACKAGE_SUMMARY.md) — Complete package overview (start here for navigation)
- [docs/DOCUMENTATION_MAP.md](docs/DOCUMENTATION_MAP.md) — How to navigate all documentation by role/use case
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — SA/technical spec with diagrams
- [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) — public API boundaries, event contracts, versioning strategy
- [docs/MFE_ADAPTER_PATTERNS.md](docs/MFE_ADAPTER_PATTERNS.md) — framework adapter implementations (React/Vue/Svelte/Solid/Next.js)
- [docs/ENTERPRISE_PATTERNS_INTERVIEW_GUIDE.md](docs/ENTERPRISE_PATTERNS_INTERVIEW_GUIDE.md) — production patterns, interview prep, how Google/TikTok build MFEs
- [docs/MFE_DEVELOPMENT_GUIDE.md](docs/MFE_DEVELOPMENT_GUIDE.md) — dev + prod build guide
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) — issue handling
- [docs/examples/typed-event-communication.ts](docs/examples/typed-event-communication.ts) — runnable example: cross-MFE type-safe events

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
    A[Clone Repo] --> B[pnpm install]
    B --> C[Setup .env]
    C --> D[pnpm dev]
    D --> E[localhost:8000]

    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style B fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style C fill:#f59e0b,stroke:#d97706,color:#fff
    style D fill:#10b981,stroke:#059669,color:#fff
    style E fill:#ec4899,stroke:#db2777,color:#fff
```

### Prerequisites

| Tool    | Version | Check           | Install                            |
| ------- | ------- | --------------- | ---------------------------------- |
| Node.js | v18+    | `node -v`       | [nodejs.org](https://nodejs.org)   |
| pnpm    | v9+     | `pnpm -v`       | `npm i -g pnpm`                    |
| Git     | Latest  | `git --version` | [git-scm.com](https://git-scm.com) |

### Installation

```bash
# 1️⃣ Clone repository
git clone <repository-url>
cd micro-fontend-base

# 2️⃣ Install dependencies
pnpm install

# 3️⃣ Start development
pnpm dev:all
```

**✨ Open [http://localhost:8000](http://localhost:8000)**

---

## 📁 Project Structure Overview

```mermaid
graph TB
    subgraph Monorepo ["Orbit Monorepo"]
        subgraph Apps ["apps/ - Applications"]
            Shell[shell<br/>Remix SSR]:::app
            React[app-react<br/>Vite + React]:::app
            Next["app-nextjs<br/>Next.js"]:::app
            Vue["app-vue<br/>Vite + Vue 3"]:::app
            Svelte["app-svelte<br/>Vite + Svelte"]:::app
            Solid["app-solidjs<br/>Vite + Solid"]:::app
        end

        subgraph Packages ["packages/ - Shared Code"]
            Core[core<br/>State & Events]:::pkg
            UI[ui<br/>Components]:::pkg
            Utils[utils<br/>Helpers]:::pkg
            Config[config<br/>Configs]:::pkg
        end

        subgraph Tooling ["Infrastructure"]
            Scripts[scripts/<br/>Automation]:::tool
            Docs[docs/<br/>Documentation]:::tool
            CI[.github/<br/>CI/CD]:::tool
        end
    end

    Shell & React & Next & Vue & Svelte & Solid -.->|"depends on"| Core & UI & Utils
    Core & UI -.->|"uses"| Config
    Scripts -.->|"builds"| Apps
    Scripts -.->|"builds"| Packages
    CI -.->|"automates"| Scripts

    classDef app fill:#10b981,stroke:#059669,color:#fff
    classDef pkg fill:#8b5cf6,stroke:#7c3aed,color:#fff
    classDef tool fill:#3b82f6,stroke:#2563eb,color:#fff
```

---

## Development Workflow

```mermaid
flowchart TB
    Start([Start]) --> Setup[Setup: pnpm install]
    Setup --> Dev[Development: pnpm dev]

    Dev --> EditCode[Edit Code]
    EditCode --> Save[Save File]
    Save --> HMR[Hot Module Reload]
    HMR --> Preview[Preview Changes]
    Preview --> Continue{Continue?}
    Continue -->|Yes| EditCode
    Continue -->|No| Test

    Test[Test: pnpm test] --> TestPass{Pass?}
    TestPass -->|No| Dev
    TestPass -->|Yes| Lint[Lint: pnpm lint]

    Lint --> LintPass{Pass?}
    LintPass -->|No| Dev
    LintPass -->|Yes| Build[Build: pnpm build]

    Build --> BuildPass{Pass?}
    BuildPass -->|No| Dev
    BuildPass -->|Yes| End([End])

    style Start fill:#3b82f6,stroke:#2563eb,color:#fff
    style Dev fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style Test fill:#f59e0b,stroke:#d97706,color:#fff
    style Lint fill:#f59e0b,stroke:#d97706,color:#fff
    style Build fill:#10b981,stroke:#059669,color:#fff
    style End fill:#3b82f6,stroke:#2563eb,color:#fff
```

---

## Common Commands

### Development

| Command          | Description                     |
| :--------------- | :------------------------------ |
| `pnpm dev:all`   | Start all apps (Shell + MFEs)   |
| `pnpm dev:shell` | Start only the Shell            |
| `pnpm storybook` | Run Storybook for UI components |

### Build & Deploy

| Command                | Description                 |
| :--------------------- | :-------------------------- |
| `pnpm build`           | Build all packages and apps |
| `pnpm build:mfes:prod` | Production build for MFEs   |

### Quality & Validation

| Command           | Description              |
| :---------------- | :----------------------- |
| `pnpm lint`       | Run ESLint               |
| `pnpm type-check` | TypeScript type checking |

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

## Architecture Overview

```mermaid
flowchart TD
    User[End User] -->|Request| Shell[Shell: Remix SSR]

    subgraph Runtime ["Browser Runtime"]
        Shell -->|Mount| React[React MFE]
        Shell -->|Mount| Vue[Vue MFE]
        Shell -->|Mount| Svelte[Svelte MFE]
        Shell -->|Mount| Solid[Solid MFE]
    end

    subgraph Shared ["Shared Layer"]
        Core[core]
        UI[ui]
    end

    React & Vue & Svelte & Solid --> Core
    React --> UI

    style User fill:#3b82f6,stroke:#2563eb,color:#fff
    style Shell fill:#10b981,stroke:#059669,color:#fff
    style React fill:#3b82f6,stroke:#2563eb,color:#fff
    style Vue fill:#3b82f6,stroke:#2563eb,color:#fff
    style Svelte fill:#3b82f6,stroke:#2563eb,color:#fff
    style Solid fill:#3b82f6,stroke:#2563eb,color:#fff
    style Core fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style UI fill:#8b5cf6,stroke:#7c3aed,color:#fff
```

See [Architecture Guide](./docs/ARCHITECTURE.md) for detailed documentation.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for the short contribution guide.

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
