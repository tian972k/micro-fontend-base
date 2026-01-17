# 🧠 Technical Overview & System Design

As a Senior Architect, this document outlines the core technical decisions and patterns that make this platform scalable and framework-agnostic.

## 1. MFE Orchestration Lifecycle

The `MfeHost` component manages the lifecycle of a remote application. It doesn't just "load" a script; it follows a robust orchestration pattern:

```mermaid
sequenceDiagram
    participant S as Shell (MfeHost)
    participant R as Remote App
    participant H as Health Check

    S->>H: GET /health.json
    alt Healthy
        H-->>S: 200 OK (Status: up)
        S->>R: GET /manifest.json
        R-->>S: 200 OK (entry, css, assets)
        S->>S: Inject CSS & JS Assets
        S->>R: Wait for window.MFE[name]
        R-->>S: Registered
        S->>R: mount(container, props)
    else Maintenance
        H-->>S: 200 OK (Status: maintenance)
        S->>S: Show MfeMaintenance UI
    else Error
        H-->>S: Connection Refused / 500
        S->>S: Show MfeError UI (Retry)
    end
```

## 2. Cross-Framework State Syncing

We use **Zustand** as our state management library because of its minimalist "vanilla" nature, which allows it to run in any JS environment (React, Vue, Svelte, or pure JS).

### State Synchronization Flow

The `syncStore` utility ensures that when state changes in App React, it is reflected in App Vue via the `EventBus`.

```mermaid
graph LR
    subgraph AppReact ["Micro-App React (`apps/app-react`)"]
        StoreA[Zustand Store]
        SyncA[syncStore Adapter]
    end

    subgraph AppVue ["Micro-App Vue (`apps/app-vue`)"]
        StoreB[Zustand Store]
        SyncB[syncStore Adapter]
    end

    Bus((Global EventBus))

    StoreA -->|Local Change| SyncA
    SyncA -->|Emit event| Bus
    Bus -->|Broadcast| SyncB
    SyncB -->|Set State| StoreB

    StoreB -->|Local Change| SyncB
    SyncB -->|Emit event| Bus
    Bus -->|Broadcast| SyncA
    SyncA -->|Set State| StoreA
```

## 3. Deployment Strategy (Smart Builds)

In a large monorepo, we avoid building everything on every commit. Our `smart-docker-build.js` script analyzes changed files using Turborepo's hashing and only builds the affected Docker images.

## 4. Design System Architecture

The `@repo/ui` package is the single source of truth for design.

- **Styling**: Tailwind CSS with shared configuration in `@repo/config`.
- **Components**: Framer Motion for animations, Radix UI for primitives.
- **Versioning**: Consumers use the workspace version during development and can be pinned in production.

## Architecture Overview

### 1. Routing Convention (Shell)

The Shell application uses a **Next.js-style folder-based routing** system:

- `app/routes/folder/page.tsx` -> `/folder`
- `app/routes/folder/layout.tsx` -> Layout for `/folder` path.
  This is implemented via a custom Vite plugin configuration bridging to Remix.

### 2. Module Federation

Lightning-fast builds and great Module Federation support via plugins.

## 5. Decision Log (ADR)

| Decision            | Logic                                                                  |
| :------------------ | :--------------------------------------------------------------------- |
| **Remix for Shell** | Excellent SSR capabilities, routing, and DX for the host application.  |
| **Vite for MFEs**   | Lightning-fast builds and great Module Federation support via plugins. |
| **Zustand Vanilla** | Avoids framework lock-in for core logic.                               |
| **pnpm Workspaces** | Efficient disk usage and strict dependency management.                 |
