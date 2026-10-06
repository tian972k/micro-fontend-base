# Creating a Micro-Frontend

## 1. Scaffold

```bash
pnpm mfe:add app-analytics react      # react | vue | svelte | solidjs
pnpm install
```

The script:

- creates `apps/app-analytics/` with a `package.json`;
- appends the app to **`MFE_APPS`** (`packages/config/src/constants/apps.ts`)
  **and** to `scripts/mfe.config.mjs`, which a test keeps in sync.

You then add the source files described below. The fastest way is to copy
`vite.config.mts`, `tailwind.config.ts`, `postcss.config.js`, `index.html`
and `src/` from the existing app of the same framework (`apps/app-react`,
`app-vue`, `app-svelte` or `app-solidjs`) and rename the app id.

Review the generated registry entry and adjust `name`, `title`,
`description`, `slug` and `accent`. The shell page
`/dashboard/app-analytics`, the sidebar entry, the dev port, the proxy path
`/api/proxy/analytics/` and the CSP origins all appear automatically.

## 2. Registry fields

| Field                   | Example         | Used for                                                              |
| ----------------------- | --------------- | --------------------------------------------------------------------- |
| `id`                    | `app-analytics` | Registration id, route, federation name (`app_analytics`)             |
| `name`                  | `Analytics`     | Sidebar label                                                         |
| `framework`             | `react`         | Build presets                                                         |
| `port`                  | `8006`          | Dev server port (unique)                                              |
| `slug`                  | `analytics`     | `/api/proxy/<slug>/`, `VITE_APP_<SLUG>_HOST` (unique)                 |
| `type`                  | `react`         | How `MfeHost` mounts it (`react`, `nextjs`, `vue`, `svelte`, `solid`) |
| `title` / `description` |                 | Page heading and `<meta name="description">`                          |
| `accent`                | `primary`       | Page colour (`primary`, `emerald`, `orange`, `blue`)                  |

## 3. Vite config

```ts
// apps/app-analytics/vite.config.mts
import react from "@vitejs/plugin-react";
import { createMfeConfig, reactShared, APP_IDS } from "@repo/config/vite";

export default createMfeConfig({
  appId: "app-analytics",
  frameworkPlugin: react(),
  federationShared: reactShared, // vueShared | svelteShared | solidShared
  entryFile: "./src/entry-mfe.tsx",
  mainFile: "./src/main.tsx",
});
```

`createMfeConfig` sets up Module Federation 2.0 (`./Mfe` expose,
`remoteEntry.js`, `mf-manifest.json`), the dev port, CORS, `health.json`,
a relative production base (`publicPath: auto`) and CSS code-splitting.

## 4. The entry (`./Mfe` expose)

The entry must register the app when it's evaluated. Use the factory for
your framework.

### React

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import {
  AppRegistry,
  createReactMfeEntry,
  MfeErrorBoundary,
} from "@repo/core/react";
import "@repo/ui/globals.css";
import App from "./App";

const AppWithBoundary = () => (
  <MfeErrorBoundary mfeId="app-analytics">
    <App />
  </MfeErrorBoundary>
);

const {
  mount,
  unmount,
  default: microApp,
} = createReactMfeEntry({
  AppComponent: AppWithBoundary,
  appId: "app-analytics",
  registry: AppRegistry,
  StrictMode: React.StrictMode,
  createRoot: ReactDOM.createRoot,
});

export { mount, unmount };
export default microApp;
```

### Vue

```ts
import { createApp } from "vue";
import { AppRegistry, createVueMfeEntry } from "@repo/core/vue";
import App from "./App.vue";

const {
  mount,
  unmount,
  default: microApp,
} = createVueMfeEntry({
  AppComponent: App,
  appId: "app-analytics",
  registry: AppRegistry,
  createApp,
});
export { mount, unmount };
export default microApp;
```

### Svelte

```ts
import App from "./App.svelte";
import { AppRegistry, createSvelteMfeEntry } from "@repo/core/svelte";

const {
  mount,
  unmount,
  default: microApp,
} = createSvelteMfeEntry({
  AppComponent: App,
  appId: "app-analytics",
  registry: AppRegistry,
});
export { mount, unmount };
export default microApp;
```

### SolidJS

```tsx
import { render } from "solid-js/web";
import { AppRegistry, createSolidMfeEntry } from "@repo/core/solid";
import App from "./App";

const {
  mount,
  unmount,
  default: microApp,
} = createSolidMfeEntry({
  appId: "app-analytics",
  registry: AppRegistry,
  renderApp: (container, props) => render(() => <App {...props} />, container),
});
export { mount, unmount };
export default microApp;
```

### Next.js

Next.js renders its own pages, and a Vite build produces the MFE bundle
into `public/` (see `apps/app-nextjs/vite.config.mts`: `outDir: "public"`,
`skipHtmlInput: true`). Use `createReactMfeEntry` in `src/entry-mfe.tsx`.

**Async work before mounting** (i18n, feature flags): wrap the factory's
`mount` in an `async` function. `MfeHost` awaits it. See
`apps/app-react/src/entry-mfe.tsx`.

## 5. Props, state and events

```ts
// Props the shell passes at mount
type MicroAppProps = {
  theme?: "light" | "dark" | "system";
  locale?: string; /* … */
};

// Shared state (same instance in every MFE)
import { userStore, themeStore, localeStore } from "@repo/core/shared";
const unsubscribe = themeStore.subscribe((s) => apply(s.theme));

// Typed, versioned events
import { runtimeEvents } from "@repo/core/shared";
runtimeEvents.emit("notification:show", { title: "Saved", variant: "success" });
const off = runtimeEvents.on("theme:set", ({ theme }) => apply(theme));
```

**Always clean up** subscriptions in your framework's unmount hook.
`unmount()` destroys the app, but subscriptions to window-level stores
outlive it.

## 6. Styling

```ts
// tailwind.config.ts
import { createMfeTailwindConfig } from "@repo/config/tailwind.config";
export default createMfeTailwindConfig("app-analytics", [
  "./src/**/*.{js,jsx,ts,tsx}",
  "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
]);
```

Add `postcss.config.js` (`tailwindcss` + `autoprefixer`) and set
`data-mfe="app-analytics"` on the standalone root element (`index.html`).
Utilities are scoped to `[data-mfe="app-analytics"]` and can't leak into
the shell. Portals need a container inside the root, see
[edge-cases.md §5.2](./edge-cases.md#52-content-rendered-through-a-portal).

## 7. Health & maintenance

`health.json` is generated at build time and served in dev:

```json
{ "status": "available", "version": "a1b2c3d4", "app": "app-analytics" }
```

Deploy `{ "status": "maintenance" }` to show the maintenance screen without
touching the shell.

## 8. Checklist before shipping

- [ ] Entry registers under the same id as `MFE_APPS`
- [ ] Root wrapped in `MfeErrorBoundary`
- [ ] Subscriptions cleaned up on unmount
- [ ] No portals to `<body>` (or a scoped container)
- [ ] `pnpm type-check lint test` green; add an e2e case if it's critical
- [ ] Deployment target + `VITE_APP_<SLUG>_HOST` / `MFE_URL_<ID>` configured
