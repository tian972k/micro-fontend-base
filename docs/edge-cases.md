# Edge Cases & Failure Handling

This is the reference for **what the platform does when something goes
wrong**: which component detects it, what the user sees, what gets reported,
and what you can tune. Every behaviour below is implemented and, where noted,
covered by a test.

> Conventions: **Detected by** = the code that notices the problem.
> **User sees** = the UI outcome. **Reported** = telemetry
> (see [observability.md](./observability.md)).

## Contents

1. [Loading a micro-frontend](#1-loading-a-micro-frontend)
2. [Mount / unmount lifecycle](#2-mount--unmount-lifecycle)
3. [Versions & deployments](#3-versions--deployments)
4. [Shared dependencies (Module Federation)](#4-shared-dependencies-module-federation)
5. [Styling & CSS](#5-styling--css)
6. [Cross-MFE state & events](#6-cross-mfe-state--events)
7. [Authentication & session](#7-authentication--session)
8. [Shell proxy (Vercel)](#8-shell-proxy-vercel)
9. [Security headers (CSP)](#9-security-headers-csp)
10. [Rendering errors inside an MFE](#10-rendering-errors-inside-an-mfe)
11. [Telemetry itself failing](#11-telemetry-itself-failing)
12. [SSR & environment differences](#12-ssr--environment-differences)
13. [Registry & configuration mistakes](#13-registry--configuration-mistakes)
14. [Development-only quirks](#14-development-only-quirks)
15. [Quick lookup table](#15-quick-lookup-table)

---

## 1. Loading a micro-frontend

The load sequence in `MfeHost` (`packages/core/src/mfe/react/mfe-host.tsx`):

```text
validate host ─► health.json ─► (maintenance? stop) ─► load remote code
      │               │                                      │
   invalid ─► ERROR   │ unreachable / 404 / 5xx ─► ERROR      ▼
                      ▼                              wait for registration (5s)
                  MAINTENANCE                                │
                                                            mount ─► MOUNTED
```

### 1.1 Invalid or malicious host URL

- **Case**: `host` is not an http(s) URL, e.g. `javascript:alert(1)`,
  `data:...`, a typo.
- **Detected by**: `normalizeMfeHost()` before the host is used in any
  `fetch`, `<script>` or `<link>`.
- **User sees**: error card _"Invalid MFE host configuration for …"_. No
  request is made.
- **Reported**: `captureError("Invalid MFE host", { source: "MfeHost.validateHost" })`.
- **Notes**: same-origin relative hosts (`/api/proxy/react/`) are valid; this
  is what the shell uses on Vercel. Hosts must still come from server
  config, never from user input. _(test: `mfe-host.test.tsx`)_

### 1.2 MFE server down / network error

- **Case**: DNS failure, connection refused, offline, CORS-blocked.
- **Detected by**: the `health.json` fetch throws.
- **User sees**: _"Connection Failed"_ with a **Retry** button. Retry
  re-runs the load in place; the page is not reloaded and shell state is
  kept.
- **Reported**: `source: "MfeHost.load"`.
- **Notes**: no remote code is downloaded when health fails.
  _(test: "reports an unreachable host instead of loading")_

### 1.3 MFE returns 404 / 5xx

- `404` → _"App Not Found"_ (wrong URL, not deployed yet).
- `>= 500` → _"Server Error"_.
- Other non-OK → _"Application Unavailable"_ with the status text.

### 1.4 Planned maintenance

- **Case**: the MFE's `health.json` returns `{ "status": "maintenance" }`.
- **User sees**: _"Under Maintenance"_ card (or your `maintenanceComponent`).
- **Notes**: the remote's code is **not loaded**. This works in both loading
  modes. To put an app in maintenance, deploy a `health.json` with that
  status; no shell change is needed. _(test: "shows maintenance and does not
  load the remote")_

### 1.5 Remote code fails to load

- **Case**: `remoteEntry.js` / `mf-manifest.json` missing, a chunk 404s, a
  syntax error in the bundle.
- **Detected by**: `loadMfeRemote()` / `loadRemote()` rejects.
- **User sees**: error card with the message; Retry available.
- **Reported**: `source: "MfeHost.load"`.

### 1.6 Code loads but the app never registers

- **Case**: the entry module ran but didn't call `AppRegistry.register()`
  (wrong `appId`, the entry was tree-shaken, an exception before
  registration).
- **Detected by**: `waitForMfe()` listens for the `mfe:registered` event and
  gives up after **5 s**.
- **User sees**: _"Timeout waiting for MicroApp "<name>" to register"_.
- **Fix**: the `appId` in the entry must equal the `MFE_APPS` id; the entry
  must be the `./Mfe` expose.

### 1.7 The user navigates away while the MFE is loading

- **Case**: route change or unmount during the health check, the code
  download, or the registration wait.
- **Behaviour**:
  - during the health check → the remote is **not downloaded**;
  - during download/registration → the app is **not mounted** into the
    detached container;
  - cleanup only calls `unmount` if this host actually mounted.
- _(tests: "does not load the remote if unmounted during the health check",
  "does not mount after the host unmounted while waiting")_

### 1.8 Props change while mounted

- `MfeHost` re-runs its effect when `name`, `host`, `type` or the serialised
  `props` change. The old instance is unmounted first.
- Props that can't be serialised (functions, cycles) don't throw; they
  serialise to a stable placeholder, so changing _only_ those won't
  remount. Pass callbacks through the event bus or stores instead.

### 1.9 Navigating between two MFE pages

- `/dashboard/:app` renders `MfeContainer` with `key={app.id}`, so React
  fully unmounts one MFE before mounting the next (no state bleeding
  between apps).

### 1.10 Same MFE mounted twice / already loaded

- If `window.MFE[name]` already exists (e.g. you navigated back), the host
  **fast-mounts** without a loading flash.
- Factories store instances per container (`WeakMap`), so two containers
  can host the same app independently.

---

## 2. Mount / unmount lifecycle

### 2.1 `mount()` throws

- **Detected by**: `MfeHost.mountMicroApp` catch.
- **User sees**: error card _"Failed to mount application"_ (or the error
  message).
- **Reported**: `source: "MfeHost.mount"`.

### 2.2 Lifecycle hooks that hang (MountManager)

- `MountManager.mount()` races the hooks against a timeout (default
  **10 s**). In `strict` mode it rejects; otherwise it reports through
  `onError` with code `MOUNT_FAILED` and resolves.
  _(test: "rejects a hanging hook after the timeout in strict mode")_

### 2.3 `unmount()` throws

- Reported via the hook's `onError` with code `UNMOUNT_FAILED`,
  `recoverable: true`. Mount bookkeeping is kept so you can retry.

### 2.4 Unmount called twice / for an unknown container

- All factories are idempotent: a second `unmount(container)` is a no-op.
  _(test: `factories.test.ts`)_

### 2.5 Duplicate registration (HMR, two bundles with the same id)

- Factories only register if the id is free (prevents HMR duplicates).
- A direct `AppRegistry.register()` on a taken id **overwrites** and logs a
  warning. _(test: "warns when overwriting an existing registration")_

---

## 3. Versions & deployments

### 3.1 A new MFE version is deployed while users have the page open

- `MfeHost` re-reads `health.json` at most once per **hour** per app
  (`VERSION_CHECK_INTERVAL`, cached in `localStorage` under
  `mfe_version_cache`).
- **Module Federation mode (default)**: browsers can't re-execute an
  ES module that has already been evaluated, so the **running version keeps
  working** and the new one loads on the next full page load. A warning is
  logged; nothing breaks. _(test: "keeps the running version instead of
  waiting for a re-registration")_
- **Manifest mode** (no `remoteLoader`): the old registration is dropped
  and the new entry script is loaded.

### 3.2 Rolling back or canarying one MFE

- Set `MFE_URL_<ID>` on the shell, e.g.
  `MFE_URL_APP_REACT=https://cdn.example.com/react/v41`. The value is read
  **per request**, so it takes effect without rebuilding or redeploying
  the shell. See [deployment.md](./deployment.md#rollback--canary).

### 3.3 MFE deployed behind a path or a proxy

- Builds use a relative base (`publicPath: "auto"`), so assets resolve next
  to `remoteEntry.js`. The same build works on its own domain, under a CDN
  path or behind `/api/proxy/<slug>/`.

### 3.4 Shell and MFE built from different commits

- Only framework runtimes are shared, with `requiredVersion: false` and
  `singleton: true`: the shell's React is used even if the remote was built
  against a different patch/minor version. Keep **majors** aligned via the
  pnpm catalog (`pnpm-workspace.yaml`). A major mismatch is a breaking
  change and must ship together.

---

## 4. Shared dependencies (Module Federation)

### 4.1 Two copies of React on the page

- Symptoms: _"Invalid hook call"_, _"Cannot read properties of null
  (reading 'useContext')"_.
- **Prevention**: the shell provides `react`, `react-dom`,
  `react-dom/client`, `react/jsx-runtime` and `react/jsx-dev-runtime` as
  singletons (`apps/shell/app/lib/federation.ts`); React remotes declare
  them shared (`reactShared`).
- **Dev-only false alarm**: right after a dev server starts, Vite may
  re-optimise dependencies and reload the page once. During that reload you
  can briefly see this error. It disappears on the next load.

### 4.2 Non-React frameworks

- Vue, Svelte and Solid remotes share only their own runtime (`vueShared`,
  `svelteShared`, `solidShared`) with each other. The shell never loads
  them unless such an MFE is mounted.

### 4.3 Platform singletons across bundles

- Stores, `EventBus`, `AppRegistry` and telemetry reporters live on
  `window`, so they're shared even though every MFE bundles its own copy of
  `@repo/core`. Don't add `@repo/core` to the federation shared list.

---

## 5. Styling & CSS

### 5.1 MFE styles leaking into the shell (or into each other)

- MFE Tailwind utilities are scoped to `[data-mfe="<appId>"]`
  (`createMfeTailwindConfig`). `MfeHost` sets `data-mfe` on its container,
  and standalone apps set it on their root.

### 5.2 Content rendered through a portal

- Dialogs, dropdowns and tooltips rendered to `<body>` are **outside** the
  scope and lose MFE styles. Render portals into a node inside the MFE root
  (Radix: `<X.Portal container={ref.current}>`).

### 5.3 MFE CSS not loaded

- In production the expose's stylesheet listed in `mf-manifest.json` is
  injected by `loadMfeRemote()`. A failed CSS fetch is **non-fatal**: the
  MFE still mounts, just unstyled.
- In dev, Vite injects CSS through `<style>` tags.

### 5.4 Duplicate preflight

- Each MFE ships Tailwind's preflight. It's identical across apps on the
  same Tailwind major, so the duplicates are harmless.

---

## 6. Cross-MFE state & events

### 6.1 One listener throws

- `EventBus.emit` catches per listener: the others still run. The error is
  logged. _(test: "keeps notifying other listeners when one throws")_

### 6.2 Feedback loops between synced stores

- `syncStore` marks remote updates as internal and doesn't re-broadcast
  them. The flag is reset in `finally`, so a throwing `setState` can't
  permanently disable broadcasting. _(test: "keeps broadcasting after a
  remote setState throws")_

### 6.3 Breaking an event payload

- Use namespaced, typed events: `createTypedEventBus<Map>("runtime:v2")`.
  Old MFEs keep listening on `runtime:v1` during the rollout. Emit on both
  until every consumer has migrated. _(test: "keeps different namespaces
  apart")_

### 6.4 Event name collisions

- Bare names like `"update"` can clash. Typed buses prefix every name with
  their namespace on the wire (`runtime:v1:theme:set`).

### 6.5 State lost on reload

- `locale` and `theme` are persisted to `localStorage`. The user store is
  rebuilt from the server session on every dashboard load. When storage is
  blocked (private mode), stores fall back to in-memory state.

---

## 7. Authentication & session

### 7.1 Forged or tampered cookie

- Sessions are signed (`createCookieSessionStorage`, `SESSION_SECRET`). An
  unsigned or modified cookie reads as "no session" and redirects to
  `/login`. _(verified: an old `auth_token=…` cookie is rejected)_

### 7.2 Session expired

- The cookie lives **7 days**. After that, protected routes redirect to
  `/login?redirectTo=<original path>`, and after login the user lands back
  where they were.

### 7.3 Open redirect via `?redirectTo=`

- `safeRedirect()` only accepts same-site relative paths. `//evil.com`,
  `/\evil.com` and absolute URLs fall back to `/dashboard`.

### 7.4 Missing `SESSION_SECRET` in production

- The shell **refuses to start** with a clear error, so it never signs
  sessions with a guessable default. In development an insecure dev secret
  is used, with a warning.

### 7.5 Rotating the secret

- `SESSION_SECRET=new,old`: new sessions are signed with `new`, existing
  ones signed with `old` stay valid until they expire.

### 7.6 Demo credentials in production

- `verifyCredentials()` accepts the demo account outside production only.
  In production nothing is accepted unless `AUTH_DEMO_*` is set explicitly.
  Replace `verifyCredentials()` with your identity provider.

### 7.7 Logout

- `POST /logout` destroys the session and clears the shared user store, so
  MFEs stop showing the old user. `GET /logout` only redirects. It never
  logs out, so a cross-site `<img src="/logout">` can't log users out.

---

## 8. Shell proxy (Vercel)

`/api/proxy/<slug>/<path>` forwards to `VITE_APP_<SLUG>_HOST`.

| Situation                                  | Response                                    |
| ------------------------------------------ | ------------------------------------------- |
| Not on Vercel (`VERCEL` unset)             | `403`, so the proxy can't be abused locally |
| No hosts configured                        | `500` with a hint                           |
| Unknown slug                               | `404` listing the available apps            |
| Health HEAD fails (cached 5 min)           | `503` + `Retry-After: 60`                   |
| Upstream timeout (5 s assets / 10 s other) | `504`                                       |
| Upstream network error                     | `503`                                       |
| Upstream 404 / 5xx                         | the same status, with a JSON error          |

Request hygiene:

- **Never forwarded upstream**: `cookie`, `authorization`, `host`,
  `x-forwarded-*`, hop-by-hop headers. The shell's session must not reach
  MFE origins.
- **Never returned**: `set-cookie`, so an MFE origin can't set cookies on
  the shell's domain. Also stripped: `content-encoding`, `content-length`
  and `transfer-encoding`, because the body is already decoded.
- **Caching**: hashed static assets get `max-age=31536000, immutable`;
  other static assets get 1 h.

---

## 9. Security headers (CSP)

### 9.1 A legitimate script or style is blocked

- Symptom: console _"Refused to load …"_.
- Allowed by default: the shell's origin, MFE origins derived from the
  registry, and scripts loaded _by_ nonce'd scripts (`'strict-dynamic'`).
- Add a CDN or analytics origin with `CSP_EXTRA_ORIGINS`.
- Debug with `CSP_MODE=report-only` (the default in dev): violations are
  reported but nothing is blocked.

### 9.2 Inline scripts

- Only scripts carrying the per-request nonce run: the Remix scripts and
  `ThemeScript`. To add an inline script, give it `nonce={useNonce()}`.

### 9.3 Framing

- `frame-ancestors 'none'` + `X-Frame-Options: DENY`. If the shell must
  be embedded, change both in `app/server/csp.server.ts`.

---

## 10. Rendering errors inside an MFE

- Wrap the MFE root in `MfeErrorBoundary` (all bundled apps do). A
  render error then shows a fallback **inside that MFE only**. The shell and
  other MFEs keep working.
- **Reported**: `source: "ErrorBoundary"` with the component stack.
- Errors outside React (event handlers, timers, promises) are caught by
  `captureGlobalErrors()` (`window.onerror` / `unhandledrejection`).

---

## 11. Telemetry itself failing

- A reporter that throws is skipped; the app and the other reporters are
  unaffected. _(test: "fans records out to every reporter and isolates
  broken ones")_
- Beacons are best-effort: `sendBeacon` falls back to `fetch(keepalive)`.
  Failures are swallowed.
- The batch flushes on page hide, so reports survive tab close and
  navigation.
- `/api/telemetry` rejects bodies over **64 KB** (`413`) and invalid JSON
  (`400`). It keeps at most **50** records per batch, and forwarding to
  `TELEMETRY_FORWARD_URL` is fire-and-forget (2 s timeout).

---

## 12. SSR & environment differences

- **`process` in the browser**: shared code never touches `process`
  directly (`globalThis.process?.env`), so it can't throw a
  `ReferenceError` in Vite-served code.
- **`window` / `localStorage` during SSR**: stores and singletons create a
  fresh in-memory instance on the server (one per request) and use
  `window` only in the browser.
- **Federation on the server**: `loadMfeRemote()` imports
  `@module-federation/runtime` lazily and only runs from an effect, so
  SSR never loads remote code.
- **Hydration**: the CSP nonce is hidden by browsers after load, so the
  client renders `nonce=""` and `ThemeScript` suppresses the warning.
- **Streaming timeout**: SSR aborts after **5 s** (`ABORT_DELAY`).

---

## 13. Registry & configuration mistakes

| Mistake                                                | What happens                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `scripts/mfe.config.mjs` differs from `MFE_APPS`       | `packages/config` unit test fails in CI                                   |
| Two apps with the same id, port or slug                | Same test fails                                                           |
| `/dashboard/<unknown-id>`                              | `404` from the route loader                                               |
| `getAppUrl("unknown")`                                 | Throws: _Unknown MFE "…" (not in MFE_APPS)_                               |
| Entry registers under a different id than the registry | Registration timeout (see 1.6)                                            |
| `MFE_URL_<ID>` points to a wrong URL                   | Health check fails, so the UI shows "Connection Failed" / "App Not Found" |

---

## 14. Development-only quirks

- **Cold start**: the first request compiles routes on demand and can take
  well over 5 s. The e2e suite allows 30 s for the first navigations.
- **Click before hydration**: submitting a Remix `<Form>` before hydration
  does a native POST. It still works, but tests should wait for
  `networkidle`.
- **Dependency re-optimisation**: see 4.1.
- **Ports busy**: dev servers use `strictPort`. Run `pnpm kill-ports`.

---

## 15. Quick lookup table

| Symptom                                | Section                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------- |
| "Invalid MFE host configuration"       | [1.1](#11-invalid-or-malicious-host-url)                                    |
| "Connection Failed"                    | [1.2](#12-mfe-server-down--network-error)                                   |
| "App Not Found" / "Server Error"       | [1.3](#13-mfe-returns-404--5xx)                                             |
| "Under Maintenance"                    | [1.4](#14-planned-maintenance)                                              |
| "Timeout waiting for MicroApp"         | [1.6](#16-code-loads-but-the-app-never-registers)                           |
| Invalid hook call / useContext of null | [4.1](#41-two-copies-of-react-on-the-page)                                  |
| MFE unstyled                           | [5.3](#53-mfe-css-not-loaded), [5.2](#52-content-rendered-through-a-portal) |
| Shell styles broken by an MFE          | [5.1](#51-mfe-styles-leaking-into-the-shell-or-into-each-other)             |
| Redirect loop to /login                | [7.2](#72-session-expired), [7.4](#74-missing-session_secret-in-production) |
| 403 / 503 / 504 from `/api/proxy`      | [8](#8-shell-proxy-vercel)                                                  |
| "Refused to load" in the console       | [9.1](#91-a-legitimate-script-or-style-is-blocked)                          |
