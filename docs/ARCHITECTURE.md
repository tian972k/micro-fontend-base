# Architecture & System Design

This document outlines the core technical decisions, patterns, and optimization strategies of the **Orbit** Micro-Frontend Platform.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Loading Strategies](#2-loading-strategies)
3. [State Management](#3-state-management)
4. [Bundle Optimization](#4-bundle-optimization)
5. [MFE Configuration](#5-mfe-configuration)
6. [Communication Patterns](#6-communication-patterns)
7. [Directory Structure](#7-directory-structure)
8. [Security Considerations](#8-security-considerations)

---

## 1. High-Level Architecture

The platform follows a **Hub-and-Spoke** architecture where the **Shell** (Remix) orchestrates multiple **Micro-Frontends (MFEs)** built with different frameworks.

### System Overview

```mermaid
flowchart TD
    User["End User"] -->|1. Request| CDN["CDN / Edge"]
    CDN -->|2. Serve Shell| Shell["Shell App (Remix SSR)"]

    subgraph "Browser Runtime"
        Shell -->|3. Mount| React["App React"]:::react
        Shell -->|3. Mount| Next["App Next.js"]:::next
        Shell -->|3. Mount| Vue["App Vue"]:::vue
        Shell -->|3. Mount| Svelte["App Svelte"]:::svelte
        Shell -->|3. Mount| Solid["App SolidJS"]:::solid
    end

    subgraph "Shared Layer"
        Core["@repo/core"]:::shared
        UI["@repo/ui"]:::shared
        Config["@repo/config"]:::shared
        Utils["@repo/utils"]:::shared
    end

    React --> Core & UI
    Next --> Core & UI
    Vue --> Core
    Svelte --> Core
    Solid --> Core

    classDef react fill:#61dafb,color:#000,stroke:#2da6cc
    classDef next fill:#000000,color:#fff,stroke:#333
    classDef vue fill:#42b883,color:#fff,stroke:#35495e
    classDef svelte fill:#ff3e00,color:#fff,stroke:#cc3200
    classDef solid fill:#2c4f7c,color:#fff,stroke:#1e3552
    classDef shared fill:#f5f5f9,color:#333,stroke:#aeaeae,stroke-dasharray: 5 5
```

### Core Components

| Component        | Role                                      | Technology             |
| ---------------- | ----------------------------------------- | ---------------------- |
| **Shell**        | Authentication, Routing, Global Layout    | Remix + React          |
| **MFEs**         | Feature-specific applications             | React/Vue/Svelte/Solid |
| **@repo/core**   | State management, EventBus, MFE utilities | TypeScript + Zustand   |
| **@repo/ui**     | Multi-framework design system             | Tailwind + CVA         |
| **@repo/config** | Centralized configurations                | TypeScript             |
| **@repo/utils**  | Shared utilities                          | TypeScript             |

### Key Design Principles

1. **Framework Agnostic**: Each MFE can use its optimal framework
2. **Independent Deployment**: MFEs can be deployed without affecting others
3. **Shared Dependencies**: Common code is shared to reduce bundle size
4. **Loose Coupling**: MFEs communicate via events, not direct imports
5. **Progressive Loading**: MFEs load on-demand when needed

---

## 2. Loading Strategies

We utilize a **Hybrid Loading Strategy** to balance Developer Experience (DX) and Production Stability.

### Development: Module Federation

```mermaid
sequenceDiagram
    participant Browser
    participant Shell
    participant MFE as MFE Server

    Browser->>Shell: Visit /dashboard/react
    Shell->>MFE: Fetch remoteEntry.js (localhost:8001)
    MFE-->>Shell: Return JS Bundle
    Shell->>Shell: Execute & Mount MFE
```

- **Mechanism**: Vite Plugin Federation
- **Benefit**: Hot Module Replacement (HMR) and instant updates
- **Flow**: Shell loads `remoteEntry.js` from localhost ports

### Production: Manifest-based Loading

```mermaid
sequenceDiagram
    participant Browser
    participant Shell
    participant CDN
    participant Health as Health Check

    Browser->>Shell: Visit /dashboard/react
    Shell->>Health: GET /health.json [Pre-flight]

    alt is Healthy
        Health-->>Shell: 200 OK (status: "up")
        Shell->>CDN: Fetch manifest.json
        CDN-->>Shell: Return manifest
        Shell->>CDN: Fetch entry bundle
        Shell->>Shell: Mount MFE
    else is Maintenance
        Health-->>Shell: 200 OK (status: "maintenance")
        Shell->>Browser: Render Maintenance Banner
    else is Down
        Health-->>Shell: 500 / Timeout
        Shell->>Browser: Render "App Unavailable"
    end
```

- **Mechanism**: Native Fetch + Dynamic Import
- **Benefit**: Stability, Cacheability, Independent Deployments

### MFE Lifecycle Flow

Complete flow from user navigation to MFE render:

```mermaid
flowchart TD
    subgraph "1. User Navigation"
        A1["User clicks /dashboard/react"]
        A2["Remix Router matches route"]
    end

    subgraph "2. Shell Loading"
        B1["MfeHost component mounts"]
        B2["Check loading strategy"]
        B3{"Development?"}
    end

    subgraph "3a. Dev: Module Federation"
        C1["Fetch remoteEntry.js"]
        C2["Execute federation runtime"]
        C3["Get MFE module"]
    end

    subgraph "3b. Prod: Manifest Loading"
        D1["Fetch health.json"]
        D2{"Status?"}
        D3["Fetch manifest.json"]
        D4["Fetch entry bundle"]
        D5["Show maintenance UI"]
        D6["Show error UI"]
    end

    subgraph "4. MFE Mounting"
        E1["Get mount function"]
        E2["Create container div"]
        E3["Call mount(container, props)"]
        E4["Framework renders UI"]
    end

    subgraph "5. Cleanup (on unmount)"
        F1["Call unmount(container)"]
        F2["Framework cleanup"]
        F3["Remove container"]
    end

    A1 --> A2 --> B1 --> B2 --> B3
    B3 -->|Yes| C1 --> C2 --> C3 --> E1
    B3 -->|No| D1 --> D2
    D2 -->|up| D3 --> D4 --> E1
    D2 -->|maintenance| D5
    D2 -->|error| D6
    E1 --> E2 --> E3 --> E4
    E4 -.->|Route change| F1 --> F2 --> F3
```

### Framework-Specific Mounting

Each framework handles mounting differently:

#### React (Root API)

```typescript
// entry-mfe.tsx
mount: (container, props) => {
  const root = createRoot(container);
  root.render(<App {...props} />);
  container._reactRoot = root;
},
unmount: (container) => {
  container._reactRoot?.unmount();
}
```

#### Vue 3 (Create App)

```typescript
// entry-mfe.ts
mount: (container, props) => {
  const app = createApp(App, props);
  app.mount(container);
  container._vueApp = app;
},
unmount: (container) => {
  container._vueApp?.unmount();
}
```

#### Svelte (Component API)

```typescript
// entry-mfe.ts
mount: (container, props) => {
  const app = new App({ target: container, props });
  container._svelteApp = app;
},
unmount: (container) => {
  container._svelteApp?.$destroy();
}
```

#### SolidJS (Render/Dispose)

```typescript
// entry-mfe.tsx
mount: (container, props) => {
  const dispose = render(() => <App {...props} />, container);
  container._solidDispose = dispose;
},
unmount: (container) => {
  container._solidDispose?.();
}
```

### Multiple Instance Handling

**Same App, Multiple Places:**

- `mount()` creates independent instances
- Each call to `createApp()` or `createRoot()` is isolated
- Result: Safe. No conflict.

**Different Apps, Same Framework:**

- Each app must register with unique ID
- The `AppRegistry` validates for duplicates

> ⚠️ **Warning**: Duplicate APP_ID will cause silent failures. Run `pnpm validate:app-ids` to verify.

---

## 3. State Management

We use a **Distributed State Pattern** combining local and global state.

### Architecture Overview

```mermaid
flowchart LR
    subgraph "Local State"
        ReactState["React State<br/>(useState, Zustand)"]
        VueState["Vue State<br/>(ref, Pinia)"]
        SvelteState["Svelte State<br/>(writable)"]
        SolidState["Solid State<br/>(signals)"]
    end

    subgraph "Global State (@repo/core)"
        CounterStore["Counter Store"]
        UserStore["User Store"]
        ThemeStore["Theme Store"]
        LocaleStore["Locale Store"]
        EventBus["Event Bus"]
    end

    ReactState --> EventBus
    VueState --> EventBus
    SvelteState --> EventBus
    SolidState --> EventBus

    EventBus --> CounterStore
    EventBus --> UserStore
    EventBus --> ThemeStore
    EventBus --> LocaleStore
```

### Store Singleton Flow

All stores are singletons attached to `window` to ensure single instance across all MFEs:

```mermaid
flowchart TD
    subgraph "First MFE Load (React)"
        A1["import counterStore"] --> A2{"window[Symbol] exists?"}
        A2 -->|No| A3["Create new store"]
        A3 --> A4["Attach to window[Symbol]"]
        A4 --> A5["Return store reference"]
    end

    subgraph "Second MFE Load (Vue)"
        B1["import counterStore"] --> B2{"window[Symbol] exists?"}
        B2 -->|Yes| B5["Return existing store"]
    end

    A5 -.->|Same instance| B5
```

### Local State

Each MFE manages its own UI state using framework-native tools:

| Framework | State Tools                   |
| --------- | ----------------------------- |
| React     | useState, useReducer, Zustand |
| Vue       | ref, reactive, Pinia          |
| Svelte    | writable, readable stores     |
| SolidJS   | createSignal, createStore     |

### Global State (`@repo/core`)

For cross-MFE state, use the shared **vanilla Zustand stores** with framework-specific imports.

#### Singleton Pattern

All stores (`counterStore`, `userStore`, `themeStore`, `localeStore`) are singletons attached to `window`, ensuring all MFEs share the same instance.

```typescript
// React/Next.js - Use React hooks
import {
  useCounterStore,
  useUserStore,
  incrementCounter,
  decrementCounter
} from "@repo/core/react";

function Counter() {
  const count = useCounterStore((state) => state.count);
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => incrementCounter()}>+</button>
    </div>
  );
}

// Vue/Svelte/SolidJS - Use vanilla stores directly
import { counterStore, incrementCounter, decrementCounter } from "@repo/core/vue";

// Subscribe to changes
const unsub = counterStore.subscribe((state) => {
  console.log("Count:", state.count);
});

// Increment (auto-broadcasts via EventBus)
incrementCounter();
```

#### Built-in EventBus Sync

The `counterStore` automatically listens to `EVENT_KEYS.APP_COUNTER` events. When you call `incrementCounter()`:

1. Updates the local store state
2. Emits an event to `globalEventBus`
3. All other MFEs receive the event and update their stores

```mermaid
sequenceDiagram
    participant React as React MFE
    participant Store as counterStore
    participant Bus as EventBus
    participant Vue as Vue MFE
    participant Svelte as Svelte MFE

    Note over React,Svelte: User clicks + button in React MFE

    React->>Store: incrementCounter()
    Store->>Store: setState({count: 1})
    Store->>Bus: emit(APP_COUNTER, {count: 1})

    par Broadcast to all MFEs
        Bus->>Vue: on(APP_COUNTER)
        Bus->>Svelte: on(APP_COUNTER)
    end

    Vue->>Vue: counterStore.setState({count: 1})
    Svelte->>Svelte: counterStore.setState({count: 1})

    Note over React,Svelte: All UIs show count = 1
```

### Complete State Sync Flow

```mermaid
flowchart TD
    subgraph "User Action"
        Click["User clicks +1"]
    end

    subgraph "React MFE"
        R1["onClick handler"]
        R2["incrementCounter()"]
        R3["counterStore.setState()"]
        R4["React re-renders"]
    end

    subgraph "EventBus (window.__MFE_EVENT_BUS__)"
        E1["emit(APP_COUNTER, state)"]
        E2["Notify all listeners"]
    end

    subgraph "Vue MFE"
        V1["counterStore listener"]
        V2["Update ref value"]
        V3["Vue re-renders"]
    end

    subgraph "Svelte MFE"
        S1["counterStore listener"]
        S2["Update let binding"]
        S3["Svelte re-renders"]
    end

    Click --> R1 --> R2 --> R3
    R3 --> R4
    R3 --> E1 --> E2
    E2 --> V1 --> V2 --> V3
    E2 --> S1 --> S2 --> S3
```

### Event Bus

Framework-agnostic pub/sub for cross-app communication:

```typescript
// Use framework-specific import
import { EventBus } from "@repo/core/react"; // or /vue, /solid, /svelte

// Publish
EventBus.emit("user:login", { userId: "123" });

// Subscribe
const unsubscribe = EventBus.on("user:login", (data) => {
  console.log("User logged in:", data);
});

// Cleanup
unsubscribe();
```

---

## 4. Bundle Optimization

We achieve significant size reduction (~550KB+ per non-React app) through intelligent dependency sharing.

### Strategy

```mermaid
flowchart TD
    subgraph "Shared Dependencies Configuration"
        Base["Base Shared<br/>@repo/core, @repo/utils, dayjs"]:::base
        ReactDeps["React Shared<br/>react, react-dom, @repo/ui"]:::react
    end

    subgraph "React Cluster"
        Shell:::react
        AppReact["App React"]:::react
        AppNext["App Next.js"]:::react
    end

    subgraph "Independent Cluster"
        AppVue["App Vue"]:::poly
        AppSvelte["App Svelte"]:::poly
        AppSolid["App SolidJS"]:::poly
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

### Dependency Matrix

| App Type    | Shared Dependencies                    | Bundled Dependencies         |
| :---------- | :------------------------------------- | :--------------------------- |
| **React**   | react, react-dom, @repo/ui, @repo/core | Feature-specific libs        |
| **Next.js** | react, react-dom, @repo/ui, @repo/core | Feature-specific libs        |
| **Vue**     | @repo/core, @repo/utils                | Vue Runtime, Feature libs    |
| **Svelte**  | @repo/core, @repo/utils                | Svelte Runtime, Feature libs |
| **SolidJS** | @repo/core, @repo/utils                | Solid Runtime, Feature libs  |

### Optimization Techniques

1. **Framework Segregation**: Non-React apps don't download React
2. **Tree-Shaking**: `sideEffects: false` in all packages
3. **Code Splitting**: Dynamic imports for routes
4. **Shared Configs**: Defined in `packages/config/src/shared-deps.ts`

---

## 5. MFE Configuration

### Central Configuration

All MFE apps are defined in `scripts/mfe.config.mjs`:

```javascript
export const MFE_APPS = [
  {
    name: "app-react",
    framework: "react",
    port: 8001,
    entryFile: "entry-mfe.tsx",
    outputDir: "dist",
  },
  {
    name: "app-nextjs",
    framework: "nextjs",
    port: 8002,
    entryFile: "entry-mfe.tsx",
    outputDir: "public",
  },
  {
    name: "app-vue",
    framework: "vue",
    port: 8003,
    entryFile: "entry-mfe.ts",
    outputDir: "dist",
  },
  // ... more apps
];
```

### Configuration Flow

```mermaid
flowchart LR
    Config["mfe.config.mjs"] --> BuildScripts["Build Scripts"]
    Config --> DevManifest["Dev Manifest"]
    Config --> TurboFilters["Turbo Filters"]
    Config --> DockerBuild["Docker Build"]
    Config --> Validation["Validation"]

    BuildScripts --> BuildMfes["pnpm build:mfes"]
    DevManifest --> DevAll["pnpm dev:all"]
    TurboFilters --> TurboBuild["turbo run build"]
    DockerBuild --> SmartBuild["smart-docker-build.js"]
    Validation --> ValidateCmd["pnpm validate:mfe-config"]
```

### Helper Functions

```javascript
import {
  getMfeApps,
  getMfeAppByName,
  getMfeAppNames,
  getTurboFilters,
  validateMfeApps,
  autoDetectMfeApps,
} from "./mfe.config.mjs";

// Get all enabled apps
const apps = getMfeApps();

// Get specific app config
const reactApp = getMfeAppByName("app-react");

// Generate turbo filters
const filters = getTurboFilters(); // "--filter=app-react --filter=app-vue ..."

// Validate configuration
const { valid, missing, extra } = validateMfeApps();
```

---

## 6. Communication Patterns

### Props vs Events

```mermaid
flowchart LR
    Shell["Shell App"] -- "Props (ReadOnly)" --> MFE["Micro-Frontend"]
    MFE -- "Events (Actions)" --> EventBus{"Global Event Bus"}
    EventBus -- "Listen" --> Shell

    style Shell fill:#f9f,stroke:#333
    style MFE fill:#bbf,stroke:#333
```

| Pattern    | Use Case                  | Example                   |
| ---------- | ------------------------- | ------------------------- |
| **Props**  | Passing read-only context | Session, Theme, Locale    |
| **Events** | Triggering side effects   | Navigation, Notifications |

### Cross-MFE Communication Flow

```mermaid
sequenceDiagram
    participant User
    participant ReactMFE as React MFE
    participant Bus as EventBus
    participant Shell
    participant VueMFE as Vue MFE

    Note over User,VueMFE: Scenario: User saves data in React, Vue needs to refresh

    User->>ReactMFE: Click "Save"
    ReactMFE->>ReactMFE: API call success
    ReactMFE->>Bus: emit("data:updated", {entity: "orders"})

    par Shell handles notification
        Bus->>Shell: on("data:updated")
        Shell->>User: Show toast "Data saved!"
    and Vue refreshes
        Bus->>VueMFE: on("data:updated")
        VueMFE->>VueMFE: Refetch orders list
    end
```

### Full Navigation Flow

```mermaid
sequenceDiagram
    participant User
    participant MFE as Any MFE
    participant Bus as EventBus
    participant Shell
    participant Router as Remix Router
    participant Target as Target MFE

    User->>MFE: Click link to /settings
    MFE->>Bus: emit("nav:navigate", {path: "/settings"})
    Bus->>Shell: on("nav:navigate")
    Shell->>Router: navigate("/settings")
    Router->>Router: Match route
    Router->>Target: Render Settings MFE
    Target->>Bus: emit("mfe:mounted", {id: "settings"})
    Bus->>Shell: on("mfe:mounted")
    Shell->>Shell: Log analytics
```

### Event Naming Convention

```
namespace:action
```

| Event               | Description        |
| ------------------- | ------------------ |
| `user:login`        | User logged in     |
| `user:logout`       | User logged out    |
| `nav:navigate`      | Navigation request |
| `notification:show` | Show notification  |
| `mfe:mounted`       | MFE mounted        |
| `mfe:unmounted`     | MFE unmounted      |
| `theme:change`      | Theme changed      |

### Communication Examples

```typescript
// MFE requesting navigation
EventBus.emit("nav:navigate", { path: "/settings" });

// MFE showing notification
EventBus.emit("notification:show", {
  type: "success",
  message: "Data saved!",
});

// Shell listening for events
EventBus.on("nav:navigate", ({ path }) => {
  navigate(path);
});
```

---

## 7. Directory Structure

```text
micro-frontend-base/
├── apps/
│   ├── shell/                 # Host Application (Remix)
│   │   ├── app/               # Remix app directory
│   │   │   ├── routes/        # File-based routing
│   │   │   └── components/    # Shell components
│   │   ├── public/            # Static assets
│   │   └── Dockerfile         # Shell Docker config
│   │
│   ├── app-react/             # React MFE
│   │   ├── src/
│   │   │   ├── entry-mfe.tsx  # MFE entry point
│   │   │   ├── App.tsx        # Main component
│   │   │   └── features/      # Feature modules
│   │   └── public/
│   │       ├── health.json    # Health check
│   │       └── manifest.json  # MFE manifest
│   │
│   ├── app-vue/               # Vue MFE
│   ├── app-svelte/            # Svelte MFE
│   ├── app-solidjs/           # SolidJS MFE
│   └── app-nextjs/            # Next.js MFE
│
├── packages/
│   ├── config/                # Shared Configurations
│   │   └── src/
│   │       ├── vite/          # Vite config factory
│   │       └── constants/     # Constants (ports, APP_IDS)
│   │
│   ├── core/                  # Runtime Utilities
│   │   └── src/
│   │       ├── registry/      # AppRegistry
│   │       ├── events/        # EventBus
│   │       ├── stores/        # Zustand stores
│   │       └── mfe/           # MFE factories
│   │
│   ├── ui/                    # Design System
│   │   ├── src/
│   │   │   ├── components/    # Framework-specific
│   │   │   │   ├── react/
│   │   │   │   ├── vue/
│   │   │   │   ├── solid/
│   │   │   │   └── svelte/
│   │   │   ├── shared/        # Shared variants (CVA)
│   │   │   └── styles/        # Global CSS
│   │   ├── .storybook-react/
│   │   ├── .storybook-vue/
│   │   ├── .storybook-solid/
│   │   └── .storybook-svelte/
│   │
│   └── utils/                 # Helper Functions
│       └── src/
│           └── cn.ts          # Class name utility
│
├── scripts/
│   ├── mfe.config.mjs         # Central MFE configuration
│   ├── cli.mjs                # Interactive CLI
│   ├── create-app.mjs         # App scaffolding
│   ├── build-all-mfes.mjs     # Build script
│   └── smart-docker-build.js  # Smart Docker builds
│
├── docs/                      # Documentation
└── docker-compose.yml         # Docker orchestration
```

---

## 8. Security Considerations

### Deployment Flow

```mermaid
flowchart TD
    subgraph "CI/CD Pipeline"
        A1["Git Push"] --> A2["GitHub Actions"]
        A2 --> A3["Detect changed apps"]
        A3 --> A4["Build affected MFEs"]
        A4 --> A5["Run tests"]
        A5 --> A6["Build Docker images"]
    end

    subgraph "Docker Build"
        A6 --> B1["smart-docker-build.js"]
        B1 --> B2{"Changed apps?"}
        B2 -->|app-react| B3["Build app-react image"]
        B2 -->|app-vue| B4["Build app-vue image"]
        B2 -->|shell| B5["Build shell image"]
        B3 & B4 & B5 --> B6["Push to registry"]
    end

    subgraph "Production"
        B6 --> C1["CDN / Edge"]
        C1 --> C2["Static MFE assets"]
        B6 --> C3["Container Platform"]
        C3 --> C4["Shell container"]
    end
```

### Content Security Policy

```nginx
# nginx.conf
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
";
```

### Cross-Origin Resource Sharing

```javascript
// Shell fetching MFE manifests
const response = await fetch(manifestUrl, {
  credentials: "same-origin",
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Sandboxing Considerations

- MFEs run in the same browser context (not iframe)
- Trust boundary is at the organizational level
- Use CSP to restrict capabilities
- Validate all inter-MFE data

### Secret Management

```bash
# Never commit secrets
# Use environment variables
SESSION_SECRET=your-secret-here

# Or use a secret manager
# AWS Secrets Manager, Vault, etc.
```

---

## Related Documentation

- [Getting Started](./GETTING_STARTED.md) - Local development setup
- [Tutorial](./TUTORIAL.md) - Hands-on development guide
- [Standards](./STANDARDS.md) - Coding standards and conventions
- [Deployment](./DEPLOYMENT.md) - CI/CD and production setup
