# @repo/core

Runtime for the Orbit micro-frontend platform: loading and mounting MFEs,
the app registry, framework entry factories, cross-MFE state and typed
events, telemetry, logging and i18n.

**Full API reference → [docs/api/core.md](../../docs/api/core.md)**

## Entry points

| Import              | Use in                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `@repo/core/react`  | React / Next.js apps and the shell (`MfeHost`, hooks, `createReactMfeEntry`, error boundaries) |
| `@repo/core/vue`    | Vue apps (`createVueMfeEntry`)                                                                 |
| `@repo/core/svelte` | Svelte apps (`createSvelteMfeEntry`)                                                           |
| `@repo/core/solid`  | SolidJS apps (`createSolidMfeEntry`)                                                           |
| `@repo/core/shared` | Framework-agnostic code                                                                        |

## At a glance

```tsx
// Host: load and mount an MFE
<MfeHost
  name="app-react"
  type={MicroAppType.REACT}
  host={url}
  remoteLoader={load}
/>;

// Remote: register yourself
const {
  mount,
  unmount,
  default: app,
} = createReactMfeEntry({
  AppComponent: App,
  appId: "app-react",
  registry: AppRegistry,
  createRoot,
});

// Anywhere: shared state, typed events, telemetry
themeStore.getState().setTheme("dark");
runtimeEvents.emit("notification:show", { title: "Saved" });
telemetry.captureError(err, { mfeId: "app-react" });
```

## Guarantees

- Singletons (registry, stores, event bus, telemetry reporters) live on
  `window`, so every MFE bundle shares them.
- Failure handling (invalid host, maintenance, timeouts, unmount races,
  version changes) is documented in
  [docs/edge-cases.md](../../docs/edge-cases.md) and covered by tests in
  `test/`.
- Strict code: `no-explicit-any` and `no-console` are errors in this package.

## Scripts

```bash
pnpm --filter @repo/core test        # Vitest
pnpm --filter @repo/core type-check
pnpm --filter @repo/core lint
```
