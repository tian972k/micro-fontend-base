# Architecture & System Design (SA/Tech Spec)

This document is structured like a system design paper: goals, constraints, diagrams, operational flows, and maintenance guidance for evolving Orbit into a public MFE framework.

---

## Abstract

Orbit is a hub-and-spoke micro-frontend platform where a single **Shell** orchestrates multiple MFEs built on heterogeneous frameworks. The system prioritizes: (1) runtime isolation, (2) fast local development, (3) stable production builds, and (4) scalable configuration through a single source of truth.

---

## Goals

1. **Framework independence**: React/Vue/Svelte/Solid/Next MFEs coexist without hard coupling.
2. **Deterministic configuration**: a single registry drives IDs, ports, and runtime metadata.
3. **Safe evolution**: predictable upgrade path for new MFEs and shared packages.
4. **Observability**: consistent lifecycle logging and performance metrics.

## Non‑Goals

- Build system replacement (still Vite/Turbo).
- Monolithic UI state (only shared primitives, not full app state).
- Cross‑framework component parity for all UI widgets.

---

## System Context

```mermaid
flowchart LR
  User[User] --> Shell[Shell (Remix) :8000]
  Shell --> MFEs[Remote MFEs]
  MFEs --> Shared[Shared Packages]
```

---

## Architecture Overview

```mermaid
flowchart TD
  User[User] --> Shell[Shell (Remix) :8000]

  subgraph MFEs
    React[app-react :8001]
    Next[app-nextjs :8002]
    Vue[app-vue :8003]
    Svelte[app-svelte :8004]
    Solid[app-solidjs :8005]
  end

  subgraph Shared
    Core[@repo/core]
    UI[@repo/ui]
    Utils[@repo/utils]
    Config[@repo/config]
  end

  Shell --> React
  Shell --> Next
  Shell --> Vue
  Shell --> Svelte
  Shell --> Solid

  React -.-> Core
  React -.-> UI
  Vue -.-> Core
  Svelte -.-> Core
  Solid -.-> Core
  Core -.-> Config
  UI -.-> Config
  Utils -.-> Config
```

---

## Runtime Flow

```mermaid
sequenceDiagram
  participant User
  participant Shell
  participant MFE as Remote MFE

  User->>Shell: Navigate to route
  Shell->>MFE: Load remoteEntry.js / manifest
  MFE-->>Shell: Return bundle
  Shell->>Shell: Mount MFE
```

**Key invariant:** the Shell never imports MFE internals directly. MFEs expose mount/unmount via federation entry points.

---

## Configuration Model (Single Source of Truth)

All runtime identity and ports are generated from `MFE_APPS` in [packages/config/src/constants/apps.ts](../packages/config/src/constants/apps.ts).

```mermaid
flowchart LR
  MFE_APPS[MFE_APPS registry] --> APP_IDS[APP_IDS auto-generated]
  MFE_APPS --> PORTS[PORTS auto-generated]
```

This guarantees deterministic IDs, avoids drift, and keeps scaling linear as new MFEs are added.

---

## Build & Release (Dev vs Prod)

### Development Build

```mermaid
flowchart LR
  Dev[pnpm dev:all] --> Manifests[generate-dev-manifest]
  Manifests --> TurboDev[turbo run dev]
```

### Production Build

```mermaid
flowchart LR
  Build[pnpm build] --> Packages[Build shared packages]
  Packages --> Apps[Build apps]
  Apps --> Manifests[generate-manifest]
```

Operational guidance is documented in [docs/MFE_DEVELOPMENT_GUIDE.md](MFE_DEVELOPMENT_GUIDE.md).

---

## Observability & Diagnostics

Standardized instrumentation is provided via:

- `mfeLogger` for lifecycle + errors
- `perfMonitor` for load/mount timings
- `MfeErrorBoundary` for isolation and fallback UI

This enables:

1. Per‑MFE mount timing measurement
2. Crash containment
3. Debug toggles in dev mode

---

## Security Considerations

`MfeHost` (`packages/core/src/mfe/react/mfe-host.tsx`) dynamically injects `<script>`/`<link>` tags for the `host` it's given, and later executes whatever `mount`/`unmount` that remote registers on `window.MFE`. That makes `host` a trust boundary:

- **`host` must always come from trusted, server-controlled configuration** — see `apps/shell/app/server/config.ts`, which resolves each MFE's host from environment/port config, never from client-supplied input (query params, user profile fields, etc.).
- `MfeHost` validates `host` is a well-formed `http(s)` URL before using it (`isValidMfeHost`), as a defense-in-depth check for any other consumer of the component. This is a shape check, not an allowlist — callers that accept `host` from a less trusted source should add their own allowlist on top.
- CSS/JS assets are only injected once per URL (`document.querySelector` dedupe), so a malicious or misbehaving remote can't be used to keep injecting duplicate assets on repeated mounts.
- There is currently no Subresource Integrity (SRI) check on the loaded remote entry script. This is a known trade-off of the dynamic-script-tag loading strategy (vs. native Module Federation), acceptable when all remotes are deployed from this monorepo's own CI, but worth revisiting before allowing third-party-hosted remotes.

## MFE Registration & Mount Lifecycle

- Each remote registers itself into `window.MFE[name]` via `AppRegistry.register()` (`packages/core/src/mfe/registry.ts`). Registration also dispatches a `mfe:registered` `CustomEvent` on `window` with `{ name }` in `detail`.
- `MfeHost.waitForMfe` listens for that event instead of polling `window.MFE` on an interval, with a timeout (default 5s) as a safety net if registration never happens.
- `MountManager.mount()` (`packages/core/src/mfe/mount-manager.ts`) races the actual mount (including `onBeforeMount`/`onAfterMount` hooks) against a timeout via `Promise.race`, so a hook that hangs indefinitely can't keep the mount pending forever — the timeout now actually aborts the mount attempt rather than only logging a warning while the mount continues in the background.

## Failure Modes & Handling

| Failure Mode         | Symptom           | Detection            | Resolution                |
| -------------------- | ----------------- | -------------------- | ------------------------- |
| Remote entry missing | MFE stuck loading | Shell console errors | Restart MFE dev server    |
| Port conflict        | `EADDRINUSE`      | Dev server fails     | Run `pnpm kill-ports`     |
| Manifest mismatch    | 404 on assets     | Network tab          | Rebuild MFE and manifest  |
| Shared dep conflict  | duplicate React   | runtime warnings     | enforce shared singletons |

Detailed troubleshooting in [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md).

---

## Maintenance & Evolution

1. **Adding an MFE**: update `MFE_APPS` and run `pnpm mfe:add`.
2. **Upgrading shared deps**: bump versions in shared packages, rebuild all apps.
3. **Breaking change policy**: version shared packages before MFE upgrades.
4. **Performance regression checks**: compare `perfMonitor` metrics across releases.

---

## API Contracts & Public Boundaries

For production-grade MFE architecture, consult [docs/API_CONTRACTS.md](API_CONTRACTS.md):

- **Runtime Event Contracts**: Typed, cross-MFE event payloads (nav, auth, theme, etc.)
- **Store Access Patterns**: Safe read/write via Zustand stores
- **MFE Entry Point Interface**: Standard `mount`/`unmount` contract
- **Error Handling**: Boundary isolation to prevent crashes
- **Versioning Strategy**: SemVer policy for framework upgrades
- **Enterprise Patterns**: Feature flags, A/B testing, metrics collection

See also: [Example: Type-Safe Cross-MFE Communication](examples/typed-event-communication.ts)

---

## Public Framework Roadmap (Short)

1. Stable API surface for `@repo/core` runtime contracts ✅
2. Versioned configuration schema for `MFE_APPS`
3. CLI generator for new MFEs + documentation templates
4. Minimal adapter APIs for React/Vue/Svelte/Solid
