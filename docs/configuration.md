# Configuration Reference

## Shell (`apps/shell`)

| Variable                                 | Default                                                                 | Description                                                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `SESSION_SECRET`                         | dev-only secret                                                         | **Required in production.** Comma-separated to rotate (`new,old`). Generate with `openssl rand -base64 32` |
| `AUTH_DEMO_EMAIL` / `AUTH_DEMO_PASSWORD` | `demo@example.com` / `demo1234` outside production; unset in production | Demo account for `verifyCredentials()`                                                                     |
| `MFE_URL_<ID>`                           | none                                                                    | Runtime URL override per MFE, e.g. `MFE_URL_APP_REACT`. Read per request                                   |
| `VITE_APP_<SLUG>_HOST`                   | none                                                                    | Upstream for `/api/proxy/<slug>/` (Vercel), e.g. `VITE_APP_REACT_HOST`                                     |
| `CSP_MODE`                               | `enforce` in production, `report-only` in dev                           | `enforce` \| `report-only` \| `off`                                                                        |
| `CSP_EXTRA_ORIGINS`                      | none                                                                    | Extra allowed origins (comma-separated)                                                                    |
| `TELEMETRY_FORWARD_URL`                  | none                                                                    | Forward telemetry batches to a collector                                                                   |
| `VERCEL`                                 | set by Vercel                                                           | Enables proxy URLs and the proxy routes                                                                    |
| `SHELL_PORT`                             | `8000`                                                                  | Dev port                                                                                                   |
| `PORT`                                   | `8000`                                                                  | Port for `pnpm start` (production server)                                                                  |
| `ANALYZE`                                | none                                                                    | `true` opens a bundle visualizer on build                                                                  |

## MFEs (`apps/app-*`)

| Variable                           | Description                                     |
| ---------------------------------- | ----------------------------------------------- |
| `<NAME>_PORT` / `VITE_<NAME>_PORT` | Dev port override (`REACT_PORT`, `VUE_PORT`, …) |
| `PUBLIC_BASE_PATH` (app-react)     | Override the production base (default `./`)     |
| `MFE_MODE=true`                    | Used by some `build:mfe` scripts                |

MFE environment values that the browser needs must be prefixed `VITE_`
(Vite only exposes those).

## Turborepo

`turbo.json` lists `globalEnv` (variables that invalidate the cache) and
per-task inputs/outputs. When you add a build-time variable, add it to
`globalEnv` too, or cached builds will ignore changes to it.

## Dependency versions

Shared dependency versions are defined once in the **catalog** in
`pnpm-workspace.yaml`. Packages reference them as `"catalog:"`. To
upgrade React, Vite, Tailwind or similar, change the catalog only.
Framework **majors** must be the same for the shell and every MFE that
shares them.

## Registry

See [architecture.md](./architecture.md#single-source-of-truth-the-registry)
and [creating-a-micro-frontend.md](./creating-a-micro-frontend.md#2-registry-fields).
