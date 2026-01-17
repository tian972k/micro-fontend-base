# 🧠 Technical Overview & System Design

As a Senior Architect, this document outlines the core technical decisions, patterns, and visual architectures that make this platform scalable and framework-agnostic.

## 1. High-Level Architecture

The platform follows a **Hub-and-Spoke** architecture where the Remix Shell acts as the orchestrator for various micro-frontends.

```mermaid
graph TD
    User[End User] -->|1. Request| CDN[CDN / Edge]
    CDN -->|2. Serve Shell| Shell[Shell App (Remix SSR)]

    subgraph "Browser Runtime (Module Federation)"
        Shell -->|3. Mount| React[App React]
        Shell -->|3. Mount| Vue[App Vue]
        Shell -->|3. Mount| Svelte[App Svelte]
        Shell -->|3. Mount| Solid[App SolidJS]
    end

    subgraph "Shared Layer"
        Core[@repo/core]
        UI[@repo/ui]
        Utils[@repo/utils]
    end

    React --> Core & UI
    Vue --> Core & UI
    Svelte --> Core & UI
```

---

## 2. MFE Orchestration Lifecycle

The `MfeHost` component manages the lifecycle of a remote application. It handles loading, mounting, error boundaries, and maintenance modes.

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

---

## 3. Cross-Framework State Syncing (EventBus)

We use a **Distributed State Pattern**. Each app has its own local Zustand store, kept in sync via a global `EventBus` in `@repo/core`.

```mermaid
flowchart LR
    subgraph "App React"
        ReactStore[("Zustand Source")]
        ReactComp[React Component]
        ReactComp -->|Action| ReactStore
    end

    subgraph "App Vue"
        VueStore[("Zustand Replica")]
        VueComp[Vue Component]
        VueStore -->|Reactivity| VueComp
    end

    Bus{{"Global EventBus (@repo/core)"}}

    ReactStore -->|1. On Change| Bus
    Bus -->|2. Broadcast| VueStore
    VueStore -->|3. Update| VueComp

    style Bus fill:#f96,stroke:#333
    style ReactStore fill:#61dafb,stroke:#333
    style VueStore fill:#42b883,stroke:#333
```

---

## 4. Federated Dependency Sharing

We optimize bundle sizes by selectively sharing dependencies based on the consumer's framework.

```mermaid
classDiagram
    class BaseShared {
        @repo/core
        @repo/utils
        dayjs
    }

    class ReactShared {
        react
        react-dom
        @repo/ui (React)
    }

    class NonReactShared {
        @repo/ui (WebComponents/Native)
    }

    BaseShared <|-- ReactApps
    ReactShared <|-- ReactApps

    BaseShared <|-- NonReactApps
    NonReactShared <|-- NonReactApps

    class ReactApps {
        Shell
        App-React
        App-NextJS
    }

    class NonReactApps {
        App-Vue
        App-Svelte
        App-SolidJS
    }
```

---

## 5. Deployment Strategy (Smart Builds)

Our CI/CD pipeline uses `smart-docker-build.js` to minimize build times and costs.

```mermaid
graph TD
    Start([Git Push]) --> Turbo{Turbo Change Analysis}

    Turbo -->|Changed| React[Build App React]
    Turbo -->|Unchanged| Vue[Skip App Vue]
    Turbo -->|Changed| Shell[Build Shell]

    React --> DockerReact[Docker Build]
    Shell --> DockerShell[Docker Build]

    DockerReact --> Registry[(Container Registry)]
    DockerShell --> Registry

    Vue -.->|Use Cached| Registry
```

---

## 6. Decision Log (ADR)

| Decision            | Logic                                                                  |
| :------------------ | :--------------------------------------------------------------------- |
| **Remix for Shell** | Excellent SSR capabilities, routing, and DX for the host application.  |
| **Vite for MFEs**   | Lightning-fast builds and great Module Federation support via plugins. |
| **Zustand Vanilla** | Avoids framework lock-in for core logic.                               |
| **pnpm Workspaces** | Efficient disk usage and strict dependency management.                 |
