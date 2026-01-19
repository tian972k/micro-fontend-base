# 🪐 Orbit: Enterprise Micro-Frontend Platform

> **Production-ready, multi-framework micro-frontend architecture** optimized for scalability, performance, and developer experience.
>
> **Hub-and-Spoke Architecture:** Like planets orbiting a sun, your micro-frontends (React, Vue, Svelte) revolve around a central Remix Shell, working in perfect harmony while maintaining independence.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-red.svg)](https://turbo.build/)
[![Module Federation](https://img.shields.io/badge/Module_Federation-Vite-purple.svg)](https://github.com/originjs/vite-plugin-federation)

---

## 📚 Documentation

We have consolidated our documentation to help you get started quickly:

- **[🚀 Getting Started](./docs/GETTING_STARTED.md)**: Setup, Installation, and Running the Platform.
- **[�️ Architecture](./docs/ARCHITECTURE.md)**: System design, Module Federation intricacies, and State Management.
- **[📏 Standards](./docs/STANDARDS.md)**: Code style, Naming conventions, and Best practices.
- **[🚢 Deployment](./docs/DEPLOYMENT.md)**: CI/CD, Docker strategies, and Production setup.

---

## 🌟 Key Features

### ✨ Multi-Framework Support

Build with **React, Vue, Svelte, SolidJS, or Next.js**. Each micro-frontend can use its optimal framework while sharing state and UI components seamlessly.

### 🎯 Optimized Bundle Sizes

- **Tree-shaking enabled** with proper `sideEffects` configuration.
- **Framework-specific builds**: No React in Vue apps.
- **~550KB+ savings** per non-React app.

### ⚡ Lightning-Fast Development

- **Vite-powered** builds (< 2s for most apps).
- **Turborepo caching**.
- **Parallel builds**.

---

## 🚀 Quick Start

```bash
# Clone repository
git clone <repository-url>
cd micro-frontend-base

# Install dependencies
pnpm install

# Start development
pnpm dev
```

See the [Getting Started Guide](./docs/GETTING_STARTED.md) for full details.

---

## 📦 Project Structure

```text
micro-frontend-base/
├── apps/
│   ├── shell/           # Remix host application (SSR)
│   ├── app-react/       # React micro-frontend
│   ├── app-nextjs/      # Next.js micro-frontend
│   ├── app-vue/         # Vue 3 micro-frontend
│   ├── app-svelte/      # Svelte micro-frontend
│   └── app-solidjs/     # SolidJS micro-frontend
├── packages/
│   ├── ui/              # Design system & components
│   ├── core/            # State management & MFE utilities
│   ├── utils/           # Helper functions
│   └── config/          # Shared configurations
└── docs/                # Documentation
```

---

## Support

- 📖 Read the [Documentation](./docs/)
- 🐛 Report issues on GitHub
- 💬 Contact: [phamtuandev0907@gmail.com](mailto:phamtuandev0907@gmail.com)

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details
