# 🏗️ Architecture & System Design

This document outlines the core technical decisions, patterns, and optimization strategies of the **Orbit** Micro-Frontend Platform.

## 1. High-Level Architecture

The platform follows a **Hub-and-Spoke** architecture where the **Shell** (Remix) orchestrates multiple **Micro-Frontends (MFEs)** (React, Vue, Svelte, SolidJS).

```mermaid
graph TD
    User[End User] -->|1. Request| CDN["CDN / Edge"]
    CDN -->|2. Serve Shell| Shell["Shell App (Remix SSR)"]

    subgraph "Browser Runtime"
        Shell -->|3. Mount| React[App React]:::react
        Shell -->|3. Mount| Next[App Next.js]:::next
        Shell -->|3. Mount| Vue[App Vue]:::vue
        Shell -->|3. Mount| Svelte[App Svelte]:::svelte
        Shell -->|3. Mount| Solid[App SolidJS]:::solid
    end

    subgraph "Shared Layer"
        Core["@repo/core"]:::shared
        UI["@repo/ui"]:::shared
    end

    React --> Core & UI
    Next --> Core & UI
    Vue --> Core & UI
    Svelte --> Core
    Solid --> Core

    classDef react fill:#61dafb,color:#000,stroke:#2da6cc
    classDef next fill:#000000,color:#fff,stroke:#333
    classDef vue fill:#42b883,color:#fff,stroke:#35495e
    classDef svelte fill:#ff3e00,color:#fff,stroke:#cc3200
    classDef solid fill:#2c4f7c,color:#fff,stroke:#1e3552
    classDef shared fill:#f5f5f5,color:#333,stroke:#aeaeae,stroke-dasharray: 5 5
```

### Core Components

- **Shell (Host)**: Authentication, Routing, and Global Layout. Built with Remix.
- **Remotes (MFEs)**: Feature-specific applications composed of domain logic.
- **Shared Packages**:
  - `@repo/core`: State management (Zustand), EventBus, and MFE utilities.
  - `@repo/ui`: Design system (Shadcn/UI + Tailwind).
  - `@repo/config`: Centralized configurations (ESLint, TS, Ports).

---

## 2. Loading Strategies

We utilize a **Hybrid Loading Strategy** to balance Developer Experience (DX) and Production Stability.

### Development: Module Federation

- **Mechanism**: Vite Plugin Federation.
- **Benefit**: Hot Module Replacement (HMR) and instant updates.
- **Flow**: Shell loads `remoteEntry.js` from localhost ports.

### Production: Manifest-based Loading

- **Mechanism**: Native Fetch + Dynamic Import.
- **Benefit**: Stability, Cacheability, Independent Deployments.

#### Orchestration Flow

```mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant Shell as Shell (MfeHost)
    participant Remote as Remote App
    participant Health as Health Check

    Browser->>Shell: Visit /dashboard/vue
    Shell->>Health: GET /health.json (Pre-flight)

    alt is Healthy
        Health-->>Shell: 200 OK (status: "up")
        Shell->>Remote: Fetch remoteEntry.js
        Remote-->>Shell: JS Bundle
        Shell->>Remote: Fetch specific module (./entry)
        Shell->>Shell: Link Shared Dependencies (React, Core)
        Shell->>Remote: Call mount(container_id)
        Remote-->>Browser: UI Renders
    else is Maintenance
        Health-->>Shell: 200 OK (status: "maintenance")
        Shell->>Browser: Render Maintenance Banner
    else is Down
        Health-->>Shell: 500 / Timeout
        Shell->>Browser: Render Error Boundary (Retry)
    end
```

- **Flow**:
  1. Build generates `manifest.json` for each MFE.
  2. Shell fetches `health.json` to check availability.
  3. Shell fetches `manifest.json` to resolve entry assets.
  4. Script tags are injected to load the MFE.

---

## 3. State Management

We use a **Distributed State Pattern** with a Global Event Bus.

### Local State

Each MFE manages its own UI state using its framework's native tools (Context, Stores) or local Zustand instances.

### Global State (`@repo/core`)

- **EventBus**: A framework-agnostic pub/sub system for cross-app communication (e.g., `user:login`, `nav:open`).
- **Shared Stores**: Singleton Zustand stores for truly global data (User Session, Theme, Locale).

```mermaid
flowchart LR
    SourceApp[Any App] -->|Action| GlobalStore[Global Store]
    GlobalStore -->|Notify| EventBus
    EventBus -->|Update| React[React App]
    EventBus -->|Update| Next[Next.js App]
    EventBus -->|Update| Vue[Vue App]
    EventBus -->|Update| Svelte[Svelte App]
    EventBus -->|Update| Solid[SolidJS App]
```

---

## 4. Bundle Optimization

We achieve significant size reduction (~550KB+ per app) through intelligent dependency sharing.

### Strategy

1. **Framework Segregation**:
   - **React Apps** share `react`, `react-dom`, and `@repo/ui`.
   - **Non-React Apps** (Vue, Svelte) **DO NOT** download React. They bundle their own runtimes but share framework-agnostic libs like `dayjs` and `@repo/core`.

2. **Tree-Shaking**:
   - `sideEffects: false` configured in all shared packages.
   - Unused exports are stripped at build time.

3. **Shared Configs**:
   - Defined in `packages/config/src/shared-deps.ts`.

### Dependency Graph

| App Type    | Shared Deps                      | Bundled Deps                 |
| :---------- | :------------------------------- | :--------------------------- |
| **React**   | React, DOM, @repo/ui, @repo/core | Feature-specific libs        |
| **Next.js** | React, DOM, @repo/ui, @repo/core | Feature-specific libs        |
| **Vue**     | @repo/core, @repo/utils          | Vue Runtime, Feature libs    |
| **Svelte**  | @repo/core, @repo/utils          | Svelte Runtime, Feature libs |
| **SolidJS** | @repo/core, @repo/utils          | Solid Runtime, Feature libs  |

### Dependency Sharing Strategy

```mermaid
graph TD
    subgraph "Shared Dependencies Configuration"
        Base[Base Shared<br/>@repo/core, @repo/utils]:::base
        ReactDeps[React Shared<br/>react, react-dom, @repo/ui]:::react
    end

    subgraph "React Cluster"
        Shell:::react
        AppReact[App React]:::react
        AppNext[App Next.js]:::react
    end

    subgraph "Independent Cluster"
        AppVue[App Vue]:::poly
        AppSvelte[App Svelte]:::poly
        AppSolid[App SolidJS]:::poly
    end

    Base --> ReactDeps
    Base --> AppVue
    Base --> AppSvelte
    Base --> AppSolid

    ReactDeps --> Shell
    ReactDeps --> AppReact
    ReactDeps --> AppNext

    classDef base fill:#f1f5f9,stroke:#334155,stroke-width:2px,color:#000
    classDef react fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e40af
    classDef poly fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#166534
```

---

## 5. Deployment Strategy (Smart Builds)

We use **Turborepo** to optimize CI/CD pipelines.

1. **Change Analysis**: GitHub Actions check which workspaces have changed.
2. **Selective Build**: Only affected apps are rebuilt.
3. **Docker Caching**: Docker layers are cached based on `pnpm-lock.yaml`.

---

## 6. Directory Structure

```text
root/
├── apps/
│   ├── shell/           # Host Application
│   ├── app-react/       # Remote
│   └── app-vue/         # Remote
├── packages/
│   ├── config/          # Shared Constants (Ports, Apps)
│   ├── core/            # Runtime Utilities
│   ├── ui/              # Design System
│   └── utils/           # Helpers
└── docker-compose.yml   # Orchestration
```
