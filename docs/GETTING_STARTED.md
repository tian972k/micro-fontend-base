# 🚀 Getting Started Guide

Welcome to **Orbit**! This guide covers everything you need to set up your environment, run the platform, and start contributing.

## 🏁 Environment Setup

### 1. Requirements

Ensure you have the following installed:

- **Node.js**: v18+ recommended.
- **pnpm**: v8+ (We use pnpm workspaces).
- **Docker & Docker Compose**: For production simulation.

### 2. Initialization

```bash
# Clone the repository
git clone <repo-url>
cd micro-fontend-base

# Install dependencies
pnpm install

# Setup environment variables (Root config)
cp .env.example .env

# Setup Shell environment
cp apps/shell/.env.example apps/shell/.env
```

---

## 🏃‍♂️ Running the Platform

We support two main development modes: **Hybrid MFE Mode** (default) and **Standalone Mode**.

### 1. Hybrid MFE Mode (Recommended)

In this mode, you run the Shell app and all (or specific) Micro-Fontends (MFEs). The Shell handles routing and loads MFEs via Module Federation.

#### Option A: Start Everything

```bash
pnpm dev
# or
pnpm dev:all
```

#### Option B: Start Specific Apps

```bash
# Start Shell + React App + Vue App
turbo run dev --filter=shell --filter=app-react --filter=app-vue
```

> **⚠️ Important**: In dev mode, MFE apps must be running _before_ or _simultaneously_ with the Shell for it to load them correctly.

**Access Points:**

- **Shell App**: [http://localhost:8000](http://localhost:8000)
- **React MFE**: [http://localhost:8001](http://localhost:8001)
- **Next.js MFE**: [http://localhost:8002](http://localhost:8002)
- **Vue MFE**: [http://localhost:8003](http://localhost:8003)
- **Svelte MFE**: [http://localhost:8004](http://localhost:8004)
- **SolidJS MFE**: [http://localhost:8005](http://localhost:8005)

### 2. Standalone Mode

Run a single MFE in isolation without the Shell. Useful for fast iteration on feature logic.

```bash
# Run React App in standalone mode
pnpm dev:standalone:react

# Or manual flag
VITE_STANDALONE=true pnpm dev:app-react
```

### 3. Production Mode (Docker)

Simulate the production environment where NGINX serves static assets and the Shell loads them via `manifest.json`.

```bash
# Build and start all containers
docker-compose up --build

# View logs
docker-compose logs -f
```

---

## 🛠️ CLI & Tooling

We provide a **Unified CLI** to automate common tasks throughout the development lifecycle.

### Interactive CLI

The easiest way to interact with the project tools is via the interactive menu:

```bash
pnpm cli
```

**Menu Options:**

1. **create-app**: Scaffold a new micro-frontend (React, Vue, Svelte, SolidJS).
2. **generate-ui**: Create a new UI component in `@repo/ui`.
3. **onboard-check**: Verify Node.js, pnpm, and Docker versions.
4. **docker-build**: Run a "Dry Run" of the smart build system.
5. **docker-exec**: Execute the actual Docker builds for changed apps.

### Manual Scripts

If you prefer direct command execution or need to integrate with CI/CD:

#### 1. Create New App

```bash
pnpm create-app
```

_Follow the interactive prompts to select a framework and name your app._

#### 2. Generate Component

```bash
pnpm generate-ui
```

_Generates a component skeleton, styles, and Storybook story in `packages/ui`._

#### 3. Environment Check

```bash
# Verify your environment is ready
bash scripts/onboard.sh
```

#### 4. Smart Docker Build

The build system analyzes `pnpm-lock.yaml` and source files to determine which containers need rebuilding.

```bash
# Dry run (Show what would change)
node scripts/smart-docker-build.js

# Force execution (Build images)
EXECUTE=true node scripts/smart-docker-build.js
```

### Internal Build Scripts

These scripts are orchestrated by `pnpm dev` and `pnpm build`, but understanding them helps with debugging:

- **`scripts/build-all-mfes.mjs`**: Scans the `apps/` directory and triggers `pnpm build:mfe` for every detected micro-frontend.
- **`scripts/generate-manifest.mjs`**: Creates the `manifest.json` map used by the Shell to load remote assets in production.
- **`scripts/generate-dev-manifest.mjs`**: Generates a development-time manifest to help the Shell locate local dev servers.
- **`scripts/get-mfe-filters.mjs`**: A helper that generates Turborepo filter flags (e.g., `--filter=app-react --filter=app-vue`) based on available MFEs.

---

## 🧪 Testing & Linting

- **Linting**: `pnpm lint`
- **Type Checking**: `pnpm typecheck`
- **Storybook**: `pnpm storybook` (Port 6006) - View shared UI components.

---

## 🔧 Troubleshooting

### MFE Not Loading (Dev)

1. **Check Ports**: Ensure the MFE is running on the correct port defined in `.env`.
2. **CORS**: Check browser console for CORS errors.
3. **Restart**: Restart the MFE server first, then the Shell.

### Build Fails

1. **Clean Cache**: Run `pnpm clean` to clear Turbo cache.
2. **Dependencies**: Run `pnpm install` ensuring no peer dependency warnings.

### Docker Issues

1. **Rebuild**: `docker-compose up --build --force-recreate`
2. **Port Conflicts**: Ensure ports 8000-8005 are free on your host machine.
