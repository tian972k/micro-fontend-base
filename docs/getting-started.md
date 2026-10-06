# Getting Started

## Requirements

- Node.js **20+** (CI uses 20; `engines` allows 18+)
- pnpm **9** (`corepack enable` picks up the pinned `packageManager`)

## Install & run

```bash
pnpm install
pnpm dev          # frees ports, writes dev manifests, starts every app
```

| App         | URL                     |
| ----------- | ----------------------- |
| Shell       | <http://localhost:8000> |
| app-react   | <http://localhost:8001> |
| app-nextjs  | <http://localhost:8002> |
| app-vue     | <http://localhost:8003> |
| app-svelte  | <http://localhost:8004> |
| app-solidjs | <http://localhost:8005> |

Log in with the demo account **`demo@example.com` / `demo1234`**. It works
outside production only, see [security.md](./security.md#authentication).

Each MFE also runs **standalone** at its own URL, which is handy when you
work on one app in isolation.

> **Next.js MFE**: `next dev` doesn't build the federation bundle. Run
> `pnpm --filter app-nextjs dev:with-mfe` (build + watch) to load it in the
> shell during development.

## Everyday commands

| Command                           | What it does                                                            |
| --------------------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`                        | All apps in dev mode                                                    |
| `pnpm dev:shell`                  | Shell only (MFEs must be running elsewhere or show "Connection Failed") |
| `pnpm --filter app-react dev`     | One MFE                                                                 |
| `pnpm build`                      | Build everything (Turborepo, cached)                                    |
| `pnpm type-check` / `pnpm lint`   | Static checks for every workspace                                       |
| `pnpm test`                       | Unit tests (Vitest)                                                     |
| `pnpm test:e2e`                   | End-to-end tests (Playwright, starts shell + app-react)                 |
| `pnpm lhci`                       | Lighthouse budgets against the production shell build                   |
| `pnpm mfe:add <name> <framework>` | Scaffold a new MFE and register it                                      |
| `pnpm storybook`                  | UI component explorer                                                   |
| `pnpm kill-ports`                 | Free ports 8000–8005                                                    |

## Environment

Defaults work out of the box for local development. Every variable is
documented in [configuration.md](./configuration.md). The ones that matter
most:

| Variable                                 | Needed for                                            |
| ---------------------------------------- | ----------------------------------------------------- |
| `SESSION_SECRET`                         | **Required in production** (signs the session cookie) |
| `AUTH_DEMO_EMAIL` / `AUTH_DEMO_PASSWORD` | Demo login in production                              |
| `MFE_URL_<ID>`                           | Point the shell at a specific MFE build               |
| `VITE_APP_<SLUG>_HOST`                   | Upstreams for the Vercel proxy                        |

## Where to go next

- How the pieces fit: [architecture.md](./architecture.md)
- Add your own micro-frontend: [creating-a-micro-frontend.md](./creating-a-micro-frontend.md)
- What happens when things fail: [edge-cases.md](./edge-cases.md)
