# Enterprise Patterns & Interview Guide

This document is **conceptual/educational reference material** on how
large MFE platforms handle scaling, versioning, and observability — it
is not a line-by-line description of this repo's current implementation.
For what this codebase actually does today, see
[ARCHITECTURE.md](ARCHITECTURE.md) and [API_CONTRACTS.md](API_CONTRACTS.md).

> **Note on code samples below:** event names like `"nav:navigate"` /
> `"user:login"` are illustrative, not currently wired-up event keys (see
> [API_CONTRACTS.md](API_CONTRACTS.md#runtime-event-contracts) for the
> real ones). Calls use the correct real API shape
> (`globalEventBus.emit`/`globalEventBus.on`), just with placeholder
> event names.

---

## Table of Contents

1. [Module Federation Strategy](#module-federation-strategy)
2. [Shared Dependencies & Versioning](#shared-dependencies--versioning)
3. [State Management at Scale](#state-management-at-scale)
4. [Cross-MFE Communication](#cross-mfe-communication)
5. [Error Isolation & Recovery](#error-isolation--recovery)
6. [Performance Optimization](#performance-optimization)
7. [Observability & Monitoring](#observability--monitoring)
8. [Interview Questions & Answers](#interview-questions--answers)

---

## Module Federation Strategy

### Problem

Multiple frameworks (React, Vue, Svelte) cannot share a single bundle. Each must be independently deployed.

### Google Chrome's Approach

Chrome uses **internal module system** to load browser UI components at runtime with version negotiation.

### Orbit's Solution

```typescript
// Development: Module Federation (fast local iteration)
// @repo/config/src/constants/apps.ts
export const MFE_APPS = {
  "app-react": {
    port: 8001,
    remoteEntry: "http://localhost:8001/remoteEntry.js",
  },
  "app-vue": {
    port: 8003,
    remoteEntry: "http://localhost:8003/remoteEntry.js",
  },
};

// Production: Manifest-based loading (deterministic, cacheable)
// The Shell fetches a manifest that points to S3/CDN:
// {
//   "app-react": "https://cdn.example.com/mfes/app-react@1.2.3/index.js",
//   "app-vue": "https://cdn.example.com/mfes/app-vue@2.1.0/index.js"
// }
```

### Key Invariant

**The Shell never knows the internal structure of MFE code.** It only knows the entry point interface: `mount(container, props)` and `unmount(container)`.

### Interview Question

> How does Orbit handle independent deployments of different frameworks?

**Answer:**

1. **Dev**: Module Federation loads each MFE as a remote entry point (enables hot reload)
2. **Prod**: Manifest system maps MFE IDs to versioned bundles on CDN
3. **Key**: Shell decouples from MFE internals—only contracts matter (mount/unmount)
4. **Scaling**: Adding a new MFE just updates `MFE_APPS` config, no Shell changes needed

---

## Shared Dependencies & Versioning

### Problem

React, Vue, and Zustand should be **singletons** (one instance across all MFEs). But different MFEs may need different versions.

### TikTok's Approach

TikTok's internal platform uses **shared dependency trees** with version negotiation:

- If MFE A needs React 18.2 and MFE B needs React 18.0 → negotiate to 18.2 (higher)
- If MFE A needs React 17 and MFE B needs React 18 → fail fast (major version mismatch)

### Orbit's Solution

```typescript
// packages/core/package.json
{
  "name": "@repo/core",
  "version": "2.1.0",
  "peerDependencies": {
    "react": "^18.0.0",
    "zustand": "^4.0.0"
  }
}

// Each MFE declares these as shared in Module Federation:
// vite.config.ts
export default {
  plugins: [
    federation({
      shared: {
        react: { singleton: true, strictVersion: false },
        zustand: { singleton: true, requiredVersion: "^4.0.0" },
        "@repo/core": { singleton: true, requiredVersion: "^2.0.0" },
      },
    }),
  ],
};
```

### Versioning Table

| Scenario                           | Action                        |
| ---------------------------------- | ----------------------------- |
| All MFEs use React 18.2            | ✅ Works (singleton)          |
| MFE-A: React 18, MFE-B: React 18.2 | ✅ Works (negotiates to 18.2) |
| MFE-A: React 17, MFE-B: React 18   | ❌ Fails (major version bump) |
| Core updates from 2.0 to 3.0       | ⚠️ All MFEs must upgrade      |

### Interview Question

> How do you handle version mismatches between shared dependencies?

**Answer:**

1. **Singleton pattern**: Share single instance, prevent duplication
2. **Version negotiation**: Take highest compatible version (semver)
3. **Strict enforcement**: Major version bumps block deployment
4. **Gradual rollout**: New core version deployed to 10% of MFEs first, monitor, then 100%

---

## State Management at Scale

### Problem

Global state (user, theme, notifications) must be accessible to all MFEs without coupling.

### Google's Approach

Google uses **service workers + IndexedDB** for cross-window state with eventual consistency.

### Orbit's Solution: Zustand Stores

```typescript
// packages/core/src/stores/user.store.ts
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export const userStore = create<UserState>()(
  subscribeWithSelector((set) => ({
    user: null,
    isAuthenticated: false,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => set({ user: null, isAuthenticated: false }),
  })),
);

// Every MFE can read/write
import { userStore } from "@repo/core/shared";

// In React
const User = () => {
  const user = userStore((state) => state.user);
  return <div>{user?.name}</div>;
};

// In Vue (with a hook)
import { useUserStore } from "@repo/core/vue-adapter";
export default {
  setup() {
    const user = useUserStore();
    return { user };
  },
};
```

### Invariants

1. **Single source of truth**: One Zustand store per domain
2. **No direct mutations**: Always use `setState()`
3. **Subscribers get notified**: All components re-render
4. **Serializable**: Must support serialization (for service worker sync)

### Interview Question

> How does Orbit manage state across heterogeneous frameworks?

**Answer:**

1. **Zustand stores** provide framework-agnostic state (just plain JS objects)
2. **Framework adapters** (hooks for React, composables for Vue) adapt to each framework's reactivity model
3. **EventBus** for async events (login, theme changes) that trigger store updates
4. **No BFF coupling**: Stores are internal; MFEs communicate via typed events, not direct state access

---

## Cross-MFE Communication

### Problem

MFE-A navigates → MFE-B should load relevant data. But they can't import each other directly.

### TikTok's Approach

TikTok uses **global event bus** with strongly-typed payloads. This is what Orbit implements.

### Orbit's Solution: Typed EventBus

```typescript
// Step 1: Define event contract
// @repo/core/src/contracts/runtime-events.ts
export type RuntimeEventMap = {
  "nav:navigate": { to: string; replace?: boolean };
  "user:login": { userId: string; token?: string };
  "theme:set": { theme: "light" | "dark" | "system" };
};

// Step 2: MFE-A emits
globalEventBus.emit("nav:navigate", { to: "/analytics" });

// Step 3: MFE-B listens (TypeScript catches mismatches)
globalEventBus.on("nav:navigate", (payload) => {
  // payload is { to: string; replace?: boolean }
  navigate(payload.to, { replace: payload.replace ?? false });
});
```

### Why Typed Events Matter

```typescript
// ❌ Old: Runtime errors
globalEventBus.emit("navigate", { url: "/dashboard" }); // Typo: "url" not "to"
globalEventBus.on("navigate", (data) => {
  console.log(data.nonExistent); // Silently undefined
});

// ✅ New: Compile-time safety
globalEventBus.emit("nav:navigate", { to: "/dashboard" }); // ✅ TypeScript knows the shape
// globalEventBus.emit("nav:navigate", { url: "/dashboard" }); // ❌ Type error caught immediately
```

### Interview Question

> How do you ensure type-safe communication between MFEs built with different frameworks?

**Answer:**

1. **Typed contracts**: Define `RuntimeEventMap` with all allowed events
2. **EventBus**: Publish/subscribe pattern (loose coupling)
3. **Framework adapters**: Translate framework-specific reactivity to EventBus
4. **Versioning**: Event payloads follow semver; breaking changes require new event name

---

## Error Isolation & Recovery

### Problem

MFE-A crashes → could take down Shell + MFE-B.

### Amazon's Approach

Amazon's retail platform uses **error boundaries** in each MFE + centralized error telemetry.

### Orbit's Solution

```typescript
// Step 1: Error boundary wraps each MFE
// @repo/core/src/react/MfeErrorBoundary.tsx
export const MfeErrorBoundary = ({
  mfeId,
  children,
  fallback,
}: {
  mfeId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  return (
    <ErrorBoundary
      onError={(error) => {
        mfeLogger.error(`[${mfeId}] Crash detected:`, error);
        // Send to error tracking (Sentry, Datadog)
        errorTracker.capture(error, { mfeId });
      }}
      fallback={fallback || <CrashUI mfeId={mfeId} />}
    >
      {children}
    </ErrorBoundary>
  );
};

// Step 2: Use in every MFE
export const mount = async (container, props) => {
  const root = createRoot(container);
  root.render(
    <MfeErrorBoundary mfeId={APP_IDS.APP_REACT}>
      <App {...props} />
    </MfeErrorBoundary>,
  );
};
```

### Recovery Strategies

| Scenario                     | Action                                              |
| ---------------------------- | --------------------------------------------------- |
| MFE crashes during mount     | Show error UI, don't unmount Shell                  |
| MFE throws in event listener | Log error, continue other listeners                 |
| Shared package crashes       | Quarantine MFE that triggered it, mark as unhealthy |
| Shell crashes                | Browser hard refresh (user-triggered)               |

### Interview Question

> How do you prevent one failing MFE from crashing the entire application?

**Answer:**

1. **Error boundaries** catch React errors in MFE subtree
2. **Try/catch** around EventBus subscriptions
3. **Timeout guards** on cross-MFE async operations
4. **Health checks** on MFE startup (verify dependencies loaded)
5. **Graceful degradation**: Show fallback UI instead of blank screen

---

## Performance Optimization

### Problem

Loading 5 MFEs could take 10+ seconds.

### Google/Figma's Approach

1. **Code splitting**: Load only what's needed
2. **Prefetching**: Predict which MFE user will navigate to next
3. **Streaming**: Start rendering Shell while MFEs load in background

### Orbit's Solution

```typescript
// 1. Lazy load MFEs
export const MfeContainer = ({ mfeId }: { mfeId: string }) => {
  const [MFE, setMFE] = useState<any>(null);

  useEffect(() => {
    import(/* webpackChunk: `${mfeId}` */ `@mfes/${mfeId}`).then(
      (module) => {
        // Mount in next tick to ensure container is ready
        module.mount(containerRef.current);
        setMFE(module);
      },
    );
  }, [mfeId]);

  return <div ref={containerRef} />;
};

// 2. Prefetch on route prediction
export const useRoutePreload = () => {
  const navigate = useNavigate();

  return (nextMfeId: string) => {
    // Start loading before user clicks
    import(/* webpackChunk: `${nextMfeId}` */ `@mfes/${nextMfeId}`);
  };
};

// 3. Measure performance
export const perfMonitor = {
  recordMfeLoad: (mfeId: string, duration: number) => {
    // Send to analytics
    analytics.track("mfe_load", { mfeId, duration });

    // Alert if > 3s
    if (duration > 3000) {
      errorTracker.captureMessage(`Slow MFE load: ${mfeId} (${duration}ms)`);
    }
  },
};
```

### Performance Budget

| Metric                         | Target | Warning |
| ------------------------------ | :----: | :-----: |
| MFE initial load time          |  < 2s  |  > 3s   |
| MFE mount time                 |  < 1s  | > 1.5s  |
| EventBus emit → listener       | < 5ms  | > 10ms  |
| Shell startup (no MFEs loaded) |  < 1s  |  > 2s   |

### Interview Question

> How would you optimize loading time when you have 5 heavy MFEs?

**Answer:**

1. **Bundle analysis**: Identify what each MFE really needs (remove fat)
2. **Code splitting**: Separate route-based chunks
3. **Prefetching**: Load next MFE in background while user is on current one
4. **Caching**: MFE bundles cached aggressively (immutable hash filenames)
5. **Monitoring**: Track load times per MFE, alert on regressions
6. **Streaming**: Shell renders immediately, MFEs load asynchronously

---

## Observability & Monitoring

### Problem

When user reports "Dashboard is slow", how do you know which MFE is the culprit?

### Figma's Approach

Figma instruments every async operation, tracks P95/P99 latencies per feature.

### Orbit's Solution

```typescript
// Centralized logger
export const mfeLogger = {
  info: (msg: string, context?: any) => {
    console.log(`[${timestamp}] ${msg}`, context);
    analytics.log("mfe_info", { msg, context });
  },

  error: (msg: string, error?: Error, context?: any) => {
    console.error(`[${timestamp}] ${msg}`, error, context);
    errorTracker.captureException(error, {
      tags: { mfeId: context?.mfeId },
    });
  },
};

// Performance monitor
export const perfMonitor = {
  startMfeLoad: (mfeId: string) => {
    performance.mark(`mfe-load-${mfeId}-start`);
  },

  endMfeLoad: (mfeId: string) => {
    performance.mark(`mfe-load-${mfeId}-end`);
    const duration = performance.measure(
      `mfe-load-${mfeId}`,
      `mfe-load-${mfeId}-start`,
      `mfe-load-${mfeId}-end`,
    ).duration;

    // Report
    analytics.track("mfe_load_time", { mfeId, duration });
  },

  // Export for monitoring dashboards
  getAllMetrics: () => {
    const entries = performance.getEntriesByType("measure");
    return entries
      .filter((e) => e.name.includes("mfe"))
      .map((e) => ({ name: e.name, duration: e.duration }));
  },
};
```

### Monitoring Dashboard (Pseudocode)

```javascript
// Real-time dashboards should track:
{
  "app-react": {
    loadTime: { p50: 1200, p95: 2800, p99: 3500 },
    mountTime: { p50: 500, p95: 1200, p99: 1800 },
    errorRate: 0.002, // 0.2%
    lastDeploy: "2025-01-15 10:23:45",
    health: "healthy",
  },
  "app-vue": {
    loadTime: { p50: 900, p95: 2200, p99: 2800 },
    mountTime: { p50: 400, p95: 900, p99: 1300 },
    errorRate: 0.001, // 0.1%
    health: "healthy",
  },
  "app-svelte": {
    loadTime: { p50: 600, p95: 1500, p99: 2100 },
    mountTime: { p50: 300, p95: 700, p99: 1000 },
    errorRate: 0.005, // 0.5% ⚠️ elevated
    health: "warning",
  },
}
```

### Interview Question

> How would you debug a performance regression if one MFE becomes slow?

**Answer:**

1. **Check performance monitor**: Identify which MFE and which metric (load vs mount)
2. **Review recent deployments**: Correlate timing with commits
3. **Bundle analysis**: Use webpack-bundle-analyzer to find new/large dependencies
4. **Profile in DevTools**: Record performance timeline in that MFE
5. **Compare metrics**: P95 vs P99 tells you if it's tail latency or baseline slow
6. **Rollback if critical**: Quick revert while investigation continues

---

## Interview Questions & Answers

### Q1: Design a Micro-Frontend Architecture for 50+ MFEs

**Scenario**: You're building a platform like Figma, Slack, or Discord. You have 50+ feature teams, each building MFEs. How do you architect this?

**Answer Structure**:

1. **Module Federation Strategy**
   - Dev: Vite + Module Federation for local development
   - Prod: Manifest-based loading (deterministic, versionable)
   - Shared dependencies: singleton pattern with version negotiation

2. **Configuration Management**
   - Single source of truth: `MFE_APPS` registry in config package
   - Every MFE has entry: `{ port, remoteEntry, manifest }`
   - Automated validation: IDs must be unique, ports must not conflict

3. **Communication Layer**
   - Typed EventBus for async cross-MFE events
   - Zustand stores for shared state (user, theme, locale)
   - REST/GraphQL for heavy data fetching (avoid coupling)

4. **Error Handling**
   - Error boundaries in each MFE (prevent propagation)
   - Centralized error tracking (Sentry/Datadog)
   - Health checks on startup

5. **Performance**
   - Code splitting per route
   - Prefetching next MFE before navigation
   - Caching strategy: immutable hash filenames on CDN

6. **Deployment**
   - Independent deployment per MFE (CI/CD per team)
   - Version negotiation for shared packages
   - Blue/green deployment at Shell level

7. **Monitoring**
   - Per-MFE metrics: load time, mount time, error rate
   - Dashboards: P50/P95/P99 latencies
   - Alerts: if MFE takes > 3s to load or error rate > 1%

---

### Q2: How Do You Handle Breaking Changes in Shared Packages?

**Scenario**: `@repo/core` needs a major version bump. How do you roll it out to 30+ MFEs without breaking production?

**Answer**:

1. **Version the Package**
   - Core 2.0 → Core 3.0 (major version bump)
   - Tag in git: `@repo/core@3.0.0`

2. **Update One Team's MFE First (Canary)**
   - Pick a low-traffic MFE (e.g., settings, help)
   - Update their `package.json`: `@repo/core: ^3.0.0`
   - Deploy to 10% of traffic
   - Monitor error rates for 24 hours

3. **Gradual Rollout**
   - If stable: roll out to 25% → 50% → 100% of that MFE
   - Next MFE: same process
   - If errors spike: automatic rollback

4. **Parallel Support (Optional)**
   - For critical systems, run both Core 2.0 and 3.0 in parallel
   - Use feature flags to route traffic: 95% → 2.x, 5% → 3.x
   - After 2 weeks: 100% → 3.x

5. **Communication**
   - Announce breaking changes in CHANGELOG with migration guide
   - Slackbot notifies teams 1 week before deadline

---

### Q3: An MFE Is Causing the Shell to Crash. What Do You Do?

**Scenario**: Production incident. MFE-A shipped code with infinite loop. Users are seeing blank page. Fix it in 5 minutes.

**Answer**:

1. **Immediate (< 1 min)**
   - Revert MFE-A deploy to previous version
   - Monitor error rate drop
   - Notify team

2. **Short-term (1-5 min)**
   - If error boundary worked: MFE-A shows fallback UI, Shell still works
   - If error boundary failed: Shell crashes entirely
   - Check: did error boundary catch the error?

3. **Investigation**
   - Pull logs from MFE-A: what error occurred?
   - If infinite loop: check CPU usage, Network tab for looping requests
   - Check for: event listener cycles, memory leaks, unguarded recursion

4. **Fix & Prevention**
   - Deploy fix to MFE-A
   - Add timeout guards to event listeners
   - Add memory monitor to detect leaks
   - Add CI check: bundle size regression alerts

---

### Q4: Shared Package vs Store vs EventBus. Which Should You Use?

**Scenario**: You need to share `currentUser` across all MFEs. Where does it live?

**Answer**:

Use a **store** (`userStore` in Zustand):

- ✅ All MFEs read from `userStore.getState().user`
- ✅ User login event triggers `userStore.setState({ user: ... })`
- ✅ Any MFE can write via `userStore.setState()`
- ✅ All components react to changes

```typescript
// ✅ Right: Share via store
import { userStore } from "@repo/core/shared";

const user = userStore.getState().user; // Read
userStore.setState({ user: newUser }); // Write
userStore.subscribe((state) => {}); // Listen
```

Don't use:

```typescript
// ❌ Wrong: Direct import (couples MFEs)
import { currentUser } from "app-react"; // Tight coupling!

// ❌ Wrong: REST call every render (N+1 queries)
const user = await fetch("/api/user"); // Inefficient

// ❌ Wrong: Event bus for state (async, unreliable)
globalEventBus.emit("get:user", { ... }); // Missing data for 100ms
```

---

### Q5: How Do You Test MFE Adapter Integration?

**Code Example**:

```typescript
describe("React MFE Adapter", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(async () => {
    await unmount(container);
  });

  it("mounts without errors", async () => {
    await mount(container, { userId: "123" });
    expect(container.innerHTML).toContain("App");
    expect(container.querySelector("button")).toBeInTheDocument();
  });

  it("receives props correctly", async () => {
    const props = { userId: "user-123" };
    await mount(container, props);

    // Verify component rendered with correct props
    expect(screen.getByText("user-123")).toBeInTheDocument();
  });

  it("cleans up on unmount", async () => {
    await mount(container);

    const initialHTML = container.innerHTML;
    await unmount(container);

    expect(container.innerHTML).toBe("");
  });

  it("handles event bus communication", async () => {
    await mount(container);

    globalEventBus.emit("user:login", { userId: "alice" });
    await waitFor(() => {
      expect(screen.getByText("Welcome, alice")).toBeInTheDocument();
    });
  });

  it("survives multiple mount/unmount cycles", async () => {
    for (let i = 0; i < 5; i++) {
      await mount(container);
      expect(container.innerHTML).not.toBe("");

      await unmount(container);
      expect(container.innerHTML).toBe("");
    }
  });
});
```

---

## Summary: What Makes Orbit Production-Ready

| Aspect                     | Orbit Implementation                                |
| -------------------------- | --------------------------------------------------- |
| **Framework Independence** | Module Federation (dev) + Manifest (prod)           |
| **Type Safety**            | TypeScript contracts for events + stores            |
| **Error Isolation**        | Error boundaries + centralized logging              |
| **Performance**            | Code splitting, prefetching, monitoring             |
| **Scalability**            | Config-driven, no changes to Shell when adding MFEs |
| **Versioning**             | SemVer with shared dep negotiation                  |
| **Observability**          | Per-MFE metrics, health dashboards, alerts          |

**This positions Orbit as a framework suitable for:**

- Startup scaling (easily add features/teams)
- Enterprise (50+ MFEs, strict versioning)
- Competitive advantages (independent deployments, framework agility)

---

## Next Steps for Interview Preparation

1. **Familiarize yourself with the codebase:**
   - [docs/ARCHITECTURE.md](ARCHITECTURE.md)
   - [docs/API_CONTRACTS.md](API_CONTRACTS.md)
   - [docs/MFE_ADAPTER_PATTERNS.md](MFE_ADAPTER_PATTERNS.md)

2. **Run the project locally:**

   ```bash
   pnpm install
   pnpm dev:all
   # Try navigating between MFEs
   # Check browser console for EventBus logs
   ```

3. **Implement a feature:**
   - Add a new event to `RuntimeEventMap`
   - Emit from one MFE, listen in another
   - Verify type safety in TypeScript

4. **Answer mock questions:**
   - Design micro-frontend for 100+ MFEs
   - Debug performance regression
   - Handle deployment of breaking change
   - Implement error recovery strategy

Good luck! 🚀
