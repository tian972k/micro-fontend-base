# API Reference: `@repo/core`

Import from the entry point for your framework. Each one includes
everything in `shared`:

| Entry                                                                         | Adds                                                                                         |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `@repo/core/shared`                                                           | framework-agnostic API (below)                                                               |
| `@repo/core/react`                                                            | `MfeHost`, React store hooks, `createReactMfeEntry`, `MfeErrorBoundary`, `withErrorBoundary` |
| `@repo/core/vue`                                                              | `createVueMfeEntry`                                                                          |
| `@repo/core/svelte`                                                           | `createSvelteMfeEntry`                                                                       |
| `@repo/core/solid`                                                            | `createSolidMfeEntry`                                                                        |
| `@repo/core/logger`, `@repo/core/performance/monitor`, `@repo/core/contracts` | direct sub-module access                                                                     |

---

## `MfeHost` (React)

Loads, health-checks, mounts and unmounts one micro-frontend.

```tsx
<MfeHost
  name="app-react"
  type={MicroAppType.REACT}
  host="https://react.example.com" // or same-origin "/api/proxy/react/"
  remoteLoader={() => loadMfeRemote("app-react", host)} // optional
  props={{ locale: "vi" }}
/>
```

| Prop                   | Type                     | Description                                                                      |
| ---------------------- | ------------------------ | -------------------------------------------------------------------------------- |
| `name`                 | `string`                 | Registry id the MFE registers under                                              |
| `type`                 | `MicroAppType`           | Mount strategy (`REACT`, `NEXTJS`, `VUE`, `SVELTE`, `SOLID`)                     |
| `host`                 | `string`                 | Base URL of the MFE (absolute http(s) or same-origin path)                       |
| `props`                | `MicroAppProps`          | Passed to `mount()`; changes remount                                             |
| `remoteLoader`         | `() => Promise<unknown>` | Loads the remote code (Module Federation). Without it, **manifest mode** is used |
| `fallback`             | `ReactNode`              | Replaces the default error UI                                                    |
| `loadingComponent`     | `ReactNode`              | Replaces the default loading UI                                                  |
| `maintenanceComponent` | `ReactNode`              | Replaces the default maintenance UI                                              |

States: `idle → checking → loading → mounted`, or `error` / `maintenance`.
Retry re-runs the load without reloading the page. Behaviour on failure:
[edge-cases.md §1](../edge-cases.md#1-loading-a-micro-frontend).

---

## Registry

```ts
AppRegistry.register(name: string, app: MicroApp): void   // dispatches "mfe:registered"
AppRegistry.get(name): MicroApp | undefined
AppRegistry.isRegistered(name): boolean
MFE_REGISTERED_EVENT // "mfe:registered", detail: { name }

interface MicroApp {
  mount(container: HTMLElement, props: MicroAppProps): void | Promise<void>;
  unmount(container: HTMLElement): void;
}
```

Backed by `window.MFE`. Overwriting an id logs a warning.

## Entry factories

All factories return `{ mount, unmount, default: microApp }` and register
once (an HMR re-run doesn't duplicate). Instances are tracked per
container.

```ts
createReactMfeEntry({ AppComponent, appId, registry, createRoot, StrictMode? })
createVueMfeEntry({ AppComponent, appId, registry, createApp })
createSvelteMfeEntry({ AppComponent /* Svelte 4 ctor */, appId, registry })
createSolidMfeEntry({ appId, registry, renderApp: (el, props) => dispose })
```

`registry` is any `MfeRegistry` (`{ register, isRegistered }`); pass
`AppRegistry`.

## Mount strategies

`MfeStrategyFactory.get(type)` returns the strategy `MfeHost` uses.
Register a custom one with `MfeStrategyFactory.register(type, strategy)`
(for example to wrap mounts in a provider).

---

## Events

### `EventBus` (untyped, low level)

```ts
const bus = EventBus.getInstance(); // window-wide singleton (globalEventBus)
const off = bus.on<T>("name", (data: T) => {});
bus.emit("name", data);
bus.off("name", callback);
```

A throwing listener is logged and doesn't stop the others.

### Typed, versioned events (recommended)

```ts
import {
  createTypedEventBus,
  runtimeEvents,
  type RuntimeEventMap,
} from "@repo/core/shared";

type CartEvents = { "item:added": { sku: string; qty: number } };
const cart = createTypedEventBus<CartEvents>("cart:v1");

cart.emit("item:added", { sku: "A1", qty: 1 }); // payload type-checked
const off = cart.on("item:added", ({ sku }) => {});
cart.once("item:added", handler);
```

`runtimeEvents` = `createTypedEventBus<RuntimeEventMap>("runtime:v1")`
with: `nav:navigate`, `user:login`, `user:logout`, `theme:set`,
`locale:set`, `notification:show`.

Versioning rule: **additive** payload changes are fine. A **breaking**
change goes to a new namespace (`runtime:v2`) and you emit on both until
every consumer has migrated.

---

## Shared stores

Zustand vanilla stores that are window singletons (one instance per page,
shared by every MFE).

| Store          | State                                                   | Actions                                                                   |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `userStore`    | `isAuthenticated`, `user: UserProfile \| null`          | `login(user)`, `logout()`, `updateProfile(partial)`; also `userActions.*` |
| `themeStore`   | `theme: "light" \| "dark" \| "system"` (persisted)      | `setTheme(theme)`; `getResolvedTheme(theme)`                              |
| `localeStore`  | `locale: "en" \| "vi"` (persisted, synced over the bus) | `setLocale(locale)`; `LOCALES` labels                                     |
| `counterStore` | `count` (demo, synced over the bus)                     | `incrementCounter()`, `decrementCounter()`, `setCounter(n)`               |

```ts
// Any framework
const unsubscribe = themeStore.subscribe((s) => console.log(s.theme));
themeStore.getState().setTheme("dark");

// React
const theme = useThemeStore((s) => s.theme);
```

Create your own shared store:

```ts
import { createStore } from "zustand/vanilla";
import { createSingletonStore } from "@repo/core/shared";
export const cartStore = createSingletonStore("__CART_STORE__", () =>
  createStore(() => ({ items: [] as string[] })),
);
```

### `syncStore(adapter, { key, readOnly? })`

Mirrors any store over the `EventBus` (both directions, loop-safe).
Returns a cleanup function. Use it to sync across windows or iframes, or
with a store that isn't a window singleton.

---

## Telemetry

```ts
telemetry.captureError(error, { mfeId, source?, tags?, extra? }, level?)
telemetry.captureMetric(name, value, context?, unit?)
telemetry.captureEvent(name, context?)
telemetry.flush()

setTelemetryReporters([...])  /  addTelemetryReporter(r) → remove()
createBeaconReporter(endpoint, { maxBatch = 20, intervalMs = 5000 })
createSentryReporter(sentryLikeClient)
captureGlobalErrors(context) → stop()

interface TelemetryReporter { report(record: TelemetryRecord): void; flush?(): void }
```

Reporters live on `window`, so the shell installs them once and every MFE
reports through them. Built-in signals and the shell's endpoint are
covered in [observability.md](../observability.md).

---

## Error boundaries (React)

```tsx
<MfeErrorBoundary
  mfeId="app-react"
  fallback={(error, reset) => <Custom error={error} onRetry={reset} />}
  onError={(error, info) => {}}
>
  <App />
</MfeErrorBoundary>;

export default withErrorBoundary(App, "app-react");
```

They render a fallback inside the MFE only and report through telemetry.

## Lifecycle manager

`MountManager` runs `onBeforeMount` / `onAfterMount` / `onBeforeUnmount` /
`onAfterUnmount` hooks around a mount function, with a timeout (default
10 s) and `onError` reporting (`MOUNT_FAILED`, `UNMOUNT_FAILED`).

---

## Logger

```ts
import { logger, createPrefixedLogger, mfeLogger } from "@repo/core/logger";
const log = createPrefixedLogger("checkout");
log.info("…");
log.warn("…");
log.error("…", err);
log.debug("dev only");
mfeLogger.lifecycle(id, "mount" | "unmount" | "error", data);
mfeLogger.perf(label, ms);
```

`debug` only prints in development. Inside `@repo/core`, raw `console.*`
calls are a lint error: use the logger.

## Performance monitor

`perfMonitor.startMfeLoad(id)`, `endMfeLoad(id)`,
`measureMount(id, fn)`, `getMetrics(id)` and `getAllMetrics()`. In the
console: `window.__MFE_PERF__.export()`.

## i18n

```ts
await initI18n({ en: { dashboard: {...} }, vi: { dashboard: {...} } });
changeLanguage("vi"); getCurrentLanguage();
```

Merges the shared `common` namespace and keeps i18next in sync with
`localeStore`, both ways. Apps that need full control can run their own
i18next instance (as `app-react` does). Locale changes still flow through
`localeStore`.

## Types

`MicroAppType`, `MicroApp`, `MicroAppProps`, `MicroAppConfig`,
`MfeStatus`, `HealthCheckResponse` (`{ status, version?, message? }`),
`MfeManifest`, `MfeManifestEntry`, `MfeRegistry`, `User`.
