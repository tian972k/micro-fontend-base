# 🏄 Onboarding Guide

Welcome to the **Micro-Frontend Base Platform**! This guide will help you get your environment set up and understand how to work within our monorepo.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18 or later (latest LTS recommended).
- **pnpm**: `npm install -g pnpm`.
- **Git**: For version control.

## 🚀 Getting Started

1.  **Clone the Repository**:
    ```bash
    git clone [repository-url]
    cd micro-fontend-base
    ```

2.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

3.  **Setup Environment Variables**:
    For the initial setup, copy the example environment file for the shell:
    ```bash
    cp apps/shell/.env.example apps/shell/.env
    ```

4.  **Run Development Environment**:
    ```bash
    pnpm dev
    ```
    This will start the Shell and all Micro-Apps in development mode.

## 🧩 Key Concepts

### Monorepo Strategy
We use **Turborepo** to manage our build pipeline. It caches successful builds to save time.
- `pnpm build`: Build all applications and packages.
- `pnpm lint`: Run linting across the entire workspace.

### The App Shell (Remix)
The Shell is the entry point for users. It handles authentication, layout, and mounting micro-apps.

### Micro-Apps (Vite)
Individual features are built as standalone Micro-Apps. They are mounted into the Shell at runtime.

### Shared Packages
- `@repo/ui`: Shared design system.
- `@repo/core`: Communication (Event Bus) and shared types.

## 🛠️ Common Workflows

### Creating a New Micro-App
Use our scaffolding tool to quickly generate a new app:
```bash
pnpm create-app
```

### Developing a Feature
1.  Always start by creating a branch: `git checkout -b feature/your-feature-name`.
2.  Run `pnpm dev` and focus on the app you are modifying.
3.  Ensure your app exposes the required `mount` and `unmount` functions in its `entry-mfe.tsx`.

## 🆘 Troubleshooting & Support

- **MFE Not Loading**: Ensure the MFE server is running and the URL in the Shell's `.env` matches.
- **Build Errors**: Try clearing the Turborepo cache: `pnpm clean`.
- **Linting Issues**: Run `pnpm lint --fix`.

For more details, refer to the [Architecture Overview](./ARCHITECTURE.md) and [Conventions](./CONVENTIONS.md).
