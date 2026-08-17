# Changelog

All notable changes to this project are documented in this file.

## [0.1.1] - 2026-08-17

### Fixed

- **`packages/core` — `MfeHost`**: validate that `host` is a well-formed `http(s)` URL (`isValidMfeHost`) before it's ever used to build a `<script>`/`<link>` `src`. Prevents malformed or unexpectedly-sourced `host` values from being turned into a remote script load. See [docs/ARCHITECTURE.md § Security Considerations](docs/ARCHITECTURE.md#security-considerations).
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
