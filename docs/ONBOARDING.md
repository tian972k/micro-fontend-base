# Onboarding Guide - Micro-Frontend Platform

Welcome to the **Micro-Frontend Base** project! This guide will help you set up your environment, understand the architecture, and start contributing.

## 1. Prerequisites

- **Node.js**: v18+ is required.
- **pnpm**: We use pnpm for package management. Install it via `npm install -g pnpm`.
- **Docker** (Optional but recommended): For running the full stack in containers.

## 2. Setup

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd micro-fontend-base
    ```
2.  **Install dependencies**:
    ```bash
    pnpm install
    ```
3.  **Start Development Server**:
    ```bash
    pnpm dev
    ```
    This command starts the **Shell** (host) app and all configured micro-frontends in parallel.
    - Shell: http://localhost:3000
    - App A: http://localhost:3001
    - App B: http://localhost:3002
    - ...

## 3. Project Structure

We follow a **Feature-Based Architecture**. Please read [docs/ARCHITECTURE.md](./ARCHITECTURE.md) for detailed rules.

- **apps/shell**: The main container application (Remix).
- **apps/app-\***: Micro-frontend applications (React, Vue, Svelte).
- **packages/core**: Shared state management (Zustand), events, and types.
- **packages/ui**: Shared UI component library (shadcn/ui setup).
- **packages/config**: Shared configuration constants.

## 4. Workflows

### Creating a New Micro-Frontend

We have an automated script to scaffold new apps.

```bash
pnpm create-app
```

Follow the interactive prompts to choose a name and framework.
**After creation**:

1.  Go to `apps/<new-app>/src`.
2.  Refactor the structure to match `ARCHITECTURE.md` (create `features/`, `components/`, etc.).
3.  Restart `pnpm dev`.

### Adding a New Feature

1.  **Identify the domain**: e.g., "User Profile", "Billing".
2.  **Create a Feature Directory**:
    - Shell: `apps/shell/app/features/<feature-name>`
    - MFE: `apps/<app-name>/src/features/<feature-name>`
3.  **Implement**:
    - Build dumb components in `components/`.
    - Build logic in hooks or feature components.
    - Expose the main view component.
4.  **Integrate**:
    - Import the feature view into the Route/Page component.

## 5. Coding Standards

- **Strict Types**: No `any`. Define interfaces in `types.ts` or within the feature.
- **Linting**: Run `pnpm lint` before committing.
- **Commits**: Use conventional commits (feat:, fix:, docs:, chore:).

## 6. Troubleshooting

- **"UserStore is not defined"**: Ensure you are importing from `@repo/core`.
- **"Hydration Mismatch"**: Common in Remix. Ensure your server and client render the same initial HTML.

## 7. Useful Commands

- `pnpm build`: Build all apps and packages.
- `pnpm clean`: Clean node_modules and dist folders.
- `pnpm test`: Run tests (if configured).

Welcome to the team! 🚀
