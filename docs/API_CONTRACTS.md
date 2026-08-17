# API Contracts & Specifications

This document defines the public API boundaries this repo's packages
expose to the apps that consume them (`packages/core`, `packages/config`,
`packages/ui`), so MFEs can depend on a stable surface instead of internal
implementation details.

---

## Design Philosophy

**Goal**: Provide a stable surface that MFEs can depend on without
breaking when internals change, and be explicit about which parts of the
current implementation are load-bearing vs. still evolving.

---

## Runtime Event Contracts

MFEs communicate via the shared `globalEventBus` singleton
(`packages/core/src/events/event-bus.ts`). `emit`/`on`/`off` are
**instance** methods on that singleton — there's no static `EventBus.emit(...)`.

### Event Definition

```typescript
import { globalEventBus, EVENT_KEYS } from "@repo/core/shared";

// Emit
globalEventBus.emit(EVENT_KEYS.APP_COUNTER, { count: 5 });

// Listen (returns an unsubscribe function - always call it on cleanup)
const unsubscribe = globalEventBus.on(EVENT_KEYS.APP_COUNTER, (data) => {
  const payload = data as { count: number };
  console.log(payload.count);
});
```

Today's event keys live in `EVENT_KEYS`
(`packages/core/src/constants/keys.ts`) — currently just `APP_COUNTER` and
`LOCALE_CHANGE`. Payloads are `unknown` at the bus level; each listener is
responsible for narrowing the shape itself (see
`packages/core/src/state/common/counter-store.ts` for the reference
pattern), since nothing validates payload shape at runtime.

There's also a `RuntimeEventMap` type
(`packages/core/src/contracts/runtime-events.ts`) sketching a more
strongly-typed contract (`nav:navigate`, `user:login`, `theme:set`, etc.).
**As of this writing it isn't wired into `EventBus`** — nothing in the
codebase actually emits or listens for those event names. Treat it as a
design sketch for a possible future improvement (a generic, key-constrained
`emit<K extends RuntimeEventName>(key: K, payload: RuntimeEventPayload<K>)`),
not a currently-working API. See
[docs/examples/typed-event-communication.ts](examples/typed-event-communication.ts)
for a working example of the current API.

### Adding New Events

```typescript
// packages/core/src/constants/keys.ts
export const EVENT_KEYS = {
  APP_COUNTER: "APP_COUNTER",
  LOCALE_CHANGE: "LOCALE_CHANGE",
  MY_NEW_EVENT: "MY_NEW_EVENT", // add here
} as const;
```

For new **synced state**, prefer the `syncStore` helper
(`packages/core/src/state/sync-store.ts`) over hand-rolled `emit`/`on`
pairs — it handles both directions and guards against re-broadcast loops.
See `counter-store.ts` for a complete example.

---

## Store Contracts

Shared stores provide **singleton access** across MFEs.

### User Store (Example)

```typescript
import { userStore, userActions } from "@repo/core/shared";

// Read
const user = userStore.getState().user;

// Write (prefer the actions - they set isAuthenticated correctly too)
userActions.login({
  name: "Alice",
  email: "alice@example.com",
  avatarUrl: "https://example.com/avatar.png",
});

// Subscribe
userStore.subscribe((state) => {
  console.log("User updated:", state.user);
});
```

**Invariant:** Only read/write through these methods—never mutate directly.

---

## MFE Entry Point Contract

All MFEs must expose this interface (`MicroApp` /`MicroAppProps` in
`packages/core/src/types/index.ts`):

```typescript
export interface MicroApp {
  mount: (container: HTMLElement, props: MicroAppProps) => void;
  unmount: (container: HTMLElement) => void;
}

export interface MicroAppConfig {
  theme?: "light" | "dark" | "system";
  locale?: string;
  [key: string]: unknown;
}

export interface MicroAppProps extends MicroAppConfig {
  auth?: { user: User | null; token: string };
  eventBus?: unknown;
}
```

Example in React:

```typescript
import { createReactMfeEntry, APP_IDS } from "@repo/core/react";

const { mount, unmount } = createReactMfeEntry({
  appId: APP_IDS.YOUR_APP,
  AppComponent: YourComponent,
  // ...
});

export { mount, unmount };
```

---

## Error Handling Contract

MFEs must wrap with error boundary:

```typescript
import { MfeErrorBoundary } from "@repo/core/react";
import { APP_IDS } from "@repo/config";

export const App = () => (
  <MfeErrorBoundary mfeId={APP_IDS.YOUR_APP} fallback={<ErrorUI />}>
    <YourApp />
  </MfeErrorBoundary>
);
```

**Invariant:** Errors must not escape MFE boundary and crash Shell.

---

## Versioning Strategy

Packages follow standard SemVer (`@repo/core` is currently `0.1.0` — see
`packages/core/package.json`). Since all apps in this monorepo consume
`@repo/core` via the workspace protocol (`workspace:*`), there isn't
currently a real cross-version compatibility concern day-to-day — but if
this framework is ever published externally or consumed by apps outside
this monorepo, breaking changes to anything in this document should bump
the major version and be called out in `CHANGELOG.md`.

---

## Metrics & Observability

`perfMonitor` (`packages/core/src/performance/monitor.ts`) tracks MFE load
and mount timing using the Performance API. This one is real and in active
use — see `apps/app-react/src/entry-mfe.tsx` for the reference integration.

```typescript
import { perfMonitor } from "@repo/core/performance/monitor";

perfMonitor.startMfeLoad("app-react");
// ... mount logic
await perfMonitor.measureMount("app-react", () => {
  /* mount call */
});
perfMonitor.endMfeLoad("app-react");

// Export
const metrics = perfMonitor.getAllMetrics();
// [{ mfeId, loadTime, mountTime, timestamp }]
```

> Feature flags and A/B testing are **not implemented** in this codebase
> today (no `useFeatureFlag`/`getExperimentVariant` exist). If you need
> them, they'd be a natural extension of the `EVENT_KEYS`/`syncStore`
> pattern above — not something to import from `@repo/core` yet.

---

## Production Readiness Checklist

Before releasing an MFE to production:

- [ ] Entry point implements `mount`/`unmount`
- [ ] Error boundary wraps entire app
- [ ] Performance metrics are emitted (`perfMonitor`)
- [ ] Semver bump is documented in `CHANGELOG.md`
- [ ] MFE is tested with Shell integration
- [ ] Manifest is generated (`health.json`, `manifest.json`)
