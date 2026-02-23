# API Contracts & Specifications

This document defines the public API boundaries and contracts for Orbit framework—modeled on how Google Chrome, TikTok, and other large-scale platforms manage MFE interfaces.

---

## Design Philosophy

**Goal**: Provide stable, version-proof contracts that MFEs can safely extend and evolve without breaking peer MFEs.

**Inspired by:**

- **Google Chrome**: Module federation contracts + versioning for internal modules
- **TikTok**: Shared event bus with strongly-typed payloads
- **Amazon/Airbnb**: Feature flag contracts for A/B testing across MFEs

---

## Runtime Event Contracts

MFEs communicate via `EventBus` with **strongly-typed payloads**.

### Event Definition

```typescript
import {
  RuntimeEventMap,
  RuntimeEventName,
  RuntimeEventPayload,
} from "@repo/core/contracts";

// Available events
type Events = RuntimeEventMap;

// Example: Navigate
EventBus.emit("nav:navigate", { to: "/dashboard", replace: false });

// Example: User login
EventBus.emit("user:login", { userId: "123", token: "..." });

// Example: Show notification
EventBus.emit("notification:show", {
  title: "Success",
  message: "Profile updated",
  variant: "success",
});
```

### Adding New Events (Extension Pattern)

When adding cross-MFE communication, extend `RuntimeEventMap`:

```typescript
// packages/core/src/contracts/runtime-events.ts
export type RuntimeEventMap = {
  // ... existing events
  "analytics:track": { event: string; properties: Record<string, unknown> };
};
```

---

## Store Contracts

Shared stores provide **singleton access** across MFEs.

### User Store (Example)

```typescript
import { userStore } from "@repo/core/shared";

// Read
const user = userStore.getState().user;

// Write
userStore.setState({ user: { id: "123", name: "Alice" } });

// Subscribe
userStore.subscribe((state) => {
  console.log("User updated:", state.user);
});
```

**Invariant:** Only read/write through these methods—never mutate directly.

---

## MFE Entry Point Contract

All MFEs must expose this interface:

```typescript
export interface MfeEntryPoint {
  mount(container: HTMLElement, props?: MfeProps): void | Promise<void>;
  unmount(container: HTMLElement): void | Promise<void>;
}

export interface MfeProps {
  userId?: string;
  theme?: "light" | "dark";
  locale?: string;
  [key: string]: unknown;
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

### Semantic Versioning (SemVer)

```
@repo/core@2.1.0
  ↑    ↑  ↑
  |    |  └─ Patch: Bug fixes (2.1.1)
  |    └────── Minor: New APIs (2.2.0)
  └─────────── Major: Breaking changes (3.0.0)
```

### Compatibility Matrix

| Core Version  | React | Vue | Solid | Svelte |
| ------------- | :---: | :-: | :---: | :----: |
| 2.x           |  ✅   | ✅  |  ✅   |   ✅   |
| 3.0 (planned) |  ✅   | 🔶  |  🔶   |   🔶   |

🔶 = May require adapter updates

---

## Large-Scale MFE Patterns (Google/TikTok Inspiration)

### 1. Feature Flags

Control rollout of new MFE features across environments.

```typescript
import { useFeatureFlag } from "@repo/core/react";

export const Analytics = () => {
  const isNewAnalyticsDashboard = useFeatureFlag("new-analytics-dashboard");

  return isNewAnalyticsDashboard ? <NewDashboard /> : <OldDashboard />;
};
```

### 2. A/B Testing

Split traffic between MFE variants.

```typescript
import { getExperimentVariant } from "@repo/core/shared";

const variant = getExperimentVariant("exp-new-checkout");
// Returns: "control" | "treatment"
```

### 3. Metrics & Observability

All MFEs report standardized metrics.

```typescript
import { perfMonitor } from "@repo/core/performance/monitor";

perfMonitor.startMfeLoad("app-react");
// ... mount logic
perfMonitor.endMfeLoad("app-react");

// Export
const metrics = perfMonitor.getAllMetrics();
// [{mfeId, loadTime, mountTime, errors}]
```

---

## Production Readiness Checklist

Before releasing an MFE to production:

- [ ] Entry point implements `mount`/`unmount`
- [ ] Error boundary wraps entire app
- [ ] Event bus communication is typed
- [ ] Performance metrics are emitted
- [ ] Semver bump is documented
- [ ] Breaking changes are in CHANGELOG
- [ ] MFE is tested with Shell integration
- [ ] Manifest is generated (`health.json`, `manifest.json`)

---

## Related Reading

- **Google's Module System**: <https://bit.ly/google-module-federation>
- **TikTok's Micro-App Architecture**: TikTok Engineering Blog
- **Amazon's Internal MFE**: AWS re:Invent talks on monorepo scaling

---

## Next Steps

1. Implement **Feature Flags** (Q1 2026)
2. Add **A/B Testing Support** (Q2 2026)
3. Standardize **Metrics Collection** (Q1 2026)
4. Publish as **npm package** (by end of 2026)
