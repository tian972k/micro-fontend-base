# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added

- **Module Federation 2.0**: remotes build with `@module-federation/vite`
  and the shell loads them with `@module-federation/runtime`, the same path
  in dev and production. React is shared from the shell, and the expose's
  CSS is loaded from `mf-manifest.json`.
- **Single registry**: `MFE_APPS` drives routes (`/dashboard/:app`), nav,
  proxy paths, CSP origins and URLs; `MFE_URL_<ID>` repoints one MFE at
  runtime (rollback/canary).
- **Signed session auth** (`SESSION_SECRET`), `requireUser`,
  `safeRedirect`, POST-only logout.
- **Security headers**: CSP with a per-request nonce + `strict-dynamic`,
  `nosniff`, `Referrer-Policy`, `X-Frame-Options`.
- **Typed, versioned events**: `createTypedEventBus`, `runtimeEvents`.
- **Scoped MFE styles**: `createMfeTailwindConfig` (`[data-mfe]`).
- **Telemetry**: `telemetry.*`, beacon/Sentry reporters, global error
  capture, `mfe.load_to_mount`, Core Web Vitals, `POST /api/telemetry`.
- **Quality gates**: Vitest (core, config), Playwright e2e and Lighthouse CI
  budgets in CI; `type-check` in every workspace; pnpm catalog for
  versions.
- `createSingletonStore` is exported from `@repo/core/shared`.

### Fixed

- `pnpm dev` crashed (missing `scripts/mfe.config.mjs`); `pnpm mfe:add`
  crashed (`require` in an ES module).
- `MfeHost`: relative hosts rejected on Vercel; mounting after unmount;
  unhandled manifest rejection; maintenance/health ignored for federation
  loads; a version change caused a 5 s registration timeout.
- The logger threw `process is not defined` in the browser.
- The proxy forwarded the shell's cookies/authorization to MFE origins and
  accepted their `Set-Cookie`.
- MFEs never ran Tailwind (missing PostCSS config), and their CSS was
  never loaded inside the shell.
- `MfeErrorBoundary` posted to a non-existent `/api/errors`.
- Missing meta descriptions (Remix v2 meta replacement), `robots.txt`
  returning 500, WCAG AA contrast failures.
- Vercel deploys (Root Directory path doubling; shell install command).

### Removed

- `@originjs/vite-plugin-federation`, five duplicated MFE route pages, the
  unused `useMicroApp` / `MicroFrontendHost`, and the committed
  `storybook-static` build output.

### Documentation

- Rewrote the docs as a library reference: getting started, architecture,
  creating MFEs, configuration, API references, **edge cases & failure
  handling**, security, observability, testing, deployment,
  troubleshooting.

## [0.1.1] - 2026-08-17

### Fixed

- **`.github/workflows/reusable-build.yml` / `reusable-deploy-vercel.yml` / `reusable-deploy-vercel-ssr.yml`**: pinned the Vercel CLI to `vercel@59.1.3` in all three workflows instead of `vercel@latest`. The build job and deploy job each ran their own separate `npm install -g vercel@latest` at different points in time; if a new CLI version shipped in between, `vercel deploy --prebuilt` could reject the artifact from `vercel build` due to a Build Output API version mismatch between the two CLI instances. This was previously masked by the redundant local rebuild in the deploy job (see the artifact-fix entry below) — since both steps ran the same CLI instance, drift wasn't possible. Now that the redundant rebuild is gone, pinning is what actually prevents the mismatch.
- **`packages/core` — `MfeHost`**: validate that `host` is a well-formed `http(s)` URL (`isValidMfeHost`) before it's ever used to build a `<script>`/`<link>` `src`. Prevents malformed or unexpectedly-sourced `host` values from being turned into a remote script load. See [docs/security.md](docs/security.md).
- **`.github/workflows/reusable-build.yml` / `reusable-deploy-vercel.yml`**: the build job's `Upload artifact` step uploads `apps/<app>/.vercel/output`, a dot-prefixed (hidden) directory. Since `actions/upload-artifact@v4.4` (Sept 2024), hidden files/folders are excluded from uploads by default — so this artifact was silently empty. The deploy job then re-ran a full `vercel build` locally to compensate, defeating the entire point of the separate build/deploy jobs (build once, deploy prebuilt) and wasting CI time on every static-app deploy (app-react/app-vue/app-svelte/app-solidjs). Fixed by adding `include-hidden-files: true` to the upload step, fixing the download path in the deploy job to reconstruct `.vercel/output` correctly, and removing the now-redundant rebuild + its unnecessary `pnpm install`/Node setup/`packages-build` download steps from the deploy job.
- **`reusable-lint.yml`**: type-check step no longer swallows failures with `|| echo`.
- **`packages/core` — `MountManager.mount()`**: the mount timeout now actually aborts the mount via `Promise.race` instead of only logging a warning while the mount kept running in the background.
- **`packages/core` — `MfeHost` dependency array**: replaced a raw `JSON.stringify(props)` call in a `useEffect` dependency array with `safeStringifyProps`, which won't throw if `props` contains functions or circular references.

### Changed

- **`packages/core` — `MfeHost.waitForMfe`**: replaced 50ms interval polling of `window.MFE` with an event-driven wait. `AppRegistry.register()` now dispatches a `mfe:registered` `CustomEvent` on `window`, and `MfeHost` listens for it (falling back to the same 5s timeout if registration never happens).
- **`packages/core` — `MfeHost`**: `?t=<timestamp>` cache-busting on `health.json`/`manifest.json` requests is now dev-only (`isDevBuild()`). In production this was defeating CDN caching on every single `MfeHost` mount.
- Cleaned up several stray/speculative comments left over from prior refactors in `mfe-host.tsx` (e.g. "existing cache check logic preserved - skipped for brevity") that no longer reflected the actual code.
- Pinned root `devDependencies.turbo` to `2.7.5` (matching what was already resolved in `pnpm-lock.yaml`) instead of `latest`, for reproducible CI builds.

### Documentation

- Added **Security Considerations** and **MFE Registration & Mount Lifecycle** sections to `docs/ARCHITECTURE.md` describing the `host` trust boundary, the event-driven registration flow, and the mount timeout behavior.
