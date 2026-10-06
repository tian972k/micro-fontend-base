# Troubleshooting

Start with the symptom. Most runtime messages are explained in
[edge-cases.md](./edge-cases.md#15-quick-lookup-table).

## Install

```bash
pnpm store prune && rm -rf node_modules && pnpm install
```

`ERR_PNPM_OUTDATED_LOCKFILE` in CI means `package.json` changed without
`pnpm install`. Run it locally and commit `pnpm-lock.yaml`.

## Dev servers

| Symptom                                                        | Fix                                                                                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Port 800x is already in use`                                  | `pnpm kill-ports` (servers use `strictPort`)                                                                         |
| `Cannot find module '@repo/config/dist/vite.js'`               | `pnpm build:packages`, because app Vite configs import the built config package                                      |
| Next.js MFE "Connection Failed" / "App Not Found" in the shell | Run `pnpm --filter app-nextjs dev:with-mfe`; `next dev` alone doesn't build the federation bundle                    |
| One reload with `useContext` of null right after start         | Vite dependency re-optimisation; harmless, see [edge-cases §4.1](./edge-cases.md#41-two-copies-of-react-on-the-page) |
| First page load is very slow                                   | Routes compile on demand in dev                                                                                      |

## Runtime

| Message                                      | Look at                                                                                                   |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| "Invalid MFE host configuration"             | `getAppUrl()` / `MFE_URL_<ID>` value                                                                      |
| "Connection Failed"                          | Is the MFE server up? CORS? `health.json` reachable?                                                      |
| "App Not Found"                              | Wrong URL / not deployed (`404` on `health.json`)                                                         |
| "Timeout waiting for MicroApp … to register" | Entry `appId` must equal the registry id; check the Network tab for the `remoteEntry.js` / chunk requests |
| "Mount timeout …"                            | A `MountManager` hook never resolves                                                                      |
| Invalid hook call                            | Two Reacts; check `federationShared: reactShared` and shared majors                                       |
| MFE unstyled                                 | `postcss.config.js` present? Expose CSS in `mf-manifest.json`? Portal outside `[data-mfe]`?               |
| "Refused to load …" (CSP)                    | `CSP_EXTRA_ORIGINS`, or test with `CSP_MODE=report-only`                                                  |
| Always redirected to `/login`                | Production without `SESSION_SECRET` / changed secret / demo login disabled in production                  |

Useful console helpers: `window.MFE`, `window.__MFE_PERF__.export()` and
`mfeLogger.enableDebug()`.

## Build & CI

| Symptom                                         | Fix                                                                                 |
| ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| Registry test fails                             | Update `scripts/mfe.config.mjs` to match `MFE_APPS`                                 |
| E2E job can't start dev servers                 | The job must run `pnpm build:packages` first                                        |
| Lighthouse SEO fails on a new public page       | Give the route `meta` a title and description (parent meta is replaced in Remix v2) |
| Vercel `…/apps/<app>/apps/<app>` does not exist | The CLI must run from the repo root when Root Directory is `apps/<app>`             |
| Vercel `Cannot find module '@remix-run/dev'`    | `installCommand` must install workspace deps (`cd ../.. && pnpm install`)           |
| Deploy artifact empty                           | `upload-artifact` needs `include-hidden-files: true` for `.vercel/output`           |
