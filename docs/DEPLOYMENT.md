# Deployment & CI/CD Guide

This guide details the High-Performance CI/CD strategy for our Micro-Front-End Monorepo, focusing on **Docker** and **Smart Change Detection**.

## 🏗️ Architecture

We use a **Smart Build System** powered by [Turborepo](https://turbo.build/). Instead of rebuilding and redeploying every micro-service on every commit, we analyze the dependency graph to only deploy applications that have actually changed (or whose dependencies have changed).

### The Build Matrix

| Application | Type                  | Docker Environment | Dockerfile                                        |
| :---------- | :-------------------- | :----------------- | :------------------------------------------------ |
| **Shell**   | Node.js (Remix SSR)   | `node:18-alpine`   | `apps/shell/Dockerfile`                           |
| **App A**   | Static (React/Vite)   | `nginx:alpine`     | `Dockerfile.mfe`                                  |
| **App B**   | Static (Next.js/Vite) | `nginx:alpine`     | `Dockerfile.mfe` (Arg: `BUILD_OUTPUT_DIR=public`) |
| **App C**   | Static (Vue/Vite)     | `nginx:alpine`     | `Dockerfile.mfe`                                  |
| **App D**   | Static (Svelte/Vite)  | `nginx:alpine`     | `Dockerfile.mfe`                                  |

---

## 🚀 Smart Docker Build Script

We have provided a utility script at `scripts/smart-docker-build.js`.

**How it works:**

1. It accepts a `COMMIT_RANGE` environment variable (e.g., `HEAD^...HEAD`).
2. It runs `turbo run build --filter="...[$COMMIT_RANGE]" --dry-run=json` to analyze the graph.
3. It gets a list of **affected packages**.
4. It triggers `docker build` **ONLY** for the affected applications.

### Usage

```bash
# Dry Run (Check what would be built based on changes)
node scripts/smart-docker-build.js

# Execute Building of CHANGED apps
EXECUTE=true node scripts/smart-docker-build.js

# Force Build ALL apps (Ignore change detection)
FORCE_ALL=true EXECUTE=true node scripts/smart-docker-build.js
```

### Auto-Discovery & Configuration

The script **automatically finds all folders** in `apps/`.

To configure a specific app (e.g., custom Dockerfile, output directory, or image name), add an `mfe` section to its `package.json`:

```json
// apps/my-service/package.json
{
  "name": "my-service",
  "mfe": {
    "dockerfile": "Dockerfile.custom", // Optional: Defaults to Dockerfile.mfe
    "outputDir": "public", // Optional: Defaults to dist
    "imageName": "custom-service-name" // Optional: Defaults to folder name (my-service)
  }
}
```

This ensures that the build system is **fully decentralized**. You can add new apps or rename existing ones without modifying the build scripts.

---

## 📋 Common Workflows

### 1. Adding a New Micro-Front-End

1. Create a new folder in `apps/` (e.g., `apps/marketing`).
2. Add a `package.json` with the name `marketing`.
3. **That's it!** The script will automatically find it.
    - If you are using Vite, it will default to `dist/` and `Dockerfile.mfe`.
    - If you need custom settings (like Next.js), add the `mfe` config block to `package.json` as shown above.

### 2. Manual Release / Hotfix

If you need to force a deploy of a specific app (or all apps) regardless of git history:

```bash
# Force build EVERYTHING
FORCE_ALL=true EXECUTE=true node scripts/smart-docker-build.js
```

### 3. Debugging CI

To see exactly what Turbo thinks has changed without running Docker:

```bash
# Simulates a build on the checking previous commit
COMMIT_RANGE="HEAD^...HEAD" node scripts/smart-docker-build.js
```

---

## 🤖 GitHub Actions Workflow

Create a file at `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: ["main"]
  pull_request:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Important for Turbo change detection

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: "pnpm"

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint & Typecheck
        run: pnpm turbo run lint typecheck

      - name: Build Apps (Artifacts)
        # We run the build first to generate dist folders for the Docker copy
        run: pnpm turbo run build

      - name: Smart Docker Build
        env:
          EXECUTE: "true"
          # Compare against the previous commit for pushes, or the target branch for PRs
          COMMIT_RANGE: ${{ github.event_name == 'pull_request' && format('origin/{0}', github.base_ref) || 'HEAD^1' }}
          DOCKER_TAG: ${{ github.sha }}
        run: node scripts/smart-docker-build.js

      - name: Login to Docker Registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # (Optional) Push Step would go here, iterating through built images
```

## 🐳 Dockerfile Details

### Shell (`apps/shell/Dockerfile`)

A typical Node.js multi-stage build. It prunes the workspace to isolate the Shell's dependencies (using `turbo prune`), builds it, and then runs the Remix server.

### Generic MFE (`Dockerfile.mfe`)

A reusable Nginx container for all static micro-apps.

- **Args**:
  - `APP_NAME`: The folder name in `apps/` (e.g., `app-a`).
  - `BUILD_OUTPUT_DIR`: The output directory (default: `dist`, use `public` for hybrids).
