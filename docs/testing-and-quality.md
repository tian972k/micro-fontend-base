# Testing & Quality Gates

| Gate                     | Tool                                                            | Command           | Runs in CI           |
| ------------------------ | --------------------------------------------------------------- | ----------------- | -------------------- |
| Types                    | TypeScript (`tsc --noEmit`, `vue-tsc`)                          | `pnpm type-check` | ✅ affected packages |
| Lint                     | ESLint (stricter rules in `@repo/core`: no `any`, no `console`) | `pnpm lint`       | ✅ affected          |
| Unit                     | Vitest (+ Testing Library, jsdom)                               | `pnpm test`       | ✅ affected          |
| End-to-end               | Playwright                                                      | `pnpm test:e2e`   | ✅                   |
| Performance / a11y / SEO | Lighthouse CI                                                   | `pnpm lhci`       | ✅                   |
| Formatting               | Prettier + lint-staged                                          | pre-commit hook   | —                    |

## Unit tests

- `packages/core/test/*`: registry, event bus, typed events, sync store,
  mount manager, framework factories, telemetry and `MfeHost`. The
  `MfeHost` suite covers invalid hosts, relative hosts, maintenance, an
  unreachable host, unmount races and version changes.
- `packages/config/test/*`: registry integrity and drift between
  `MFE_APPS` and `scripts/mfe.config.mjs`.

```bash
pnpm --filter @repo/core test          # once
pnpm --filter @repo/core test:watch    # watch mode
```

## End-to-end tests

`playwright.config.ts` starts the **real dev servers** (shell + app-react)
and runs `e2e/*.spec.ts`:

- unauthenticated users are redirected to `/login`;
- login with the demo account lands on `/dashboard`;
- the React MFE mounts inside the shell through Module Federation with no
  page errors.

The first navigation compiles routes on demand, so those waits allow 30 s.
`e2e/helpers.ts` exposes `login(page)`.

Adding a spec for another MFE: add its dev server to `webServer`, then
assert on `#mfe-host-<id>`.

## Lighthouse CI

`lighthouserc.cjs` audits the **production** shell build: `/login`, and
the authenticated `/dashboard` using a signed session cookie from
`scripts/lhci-session-cookie.mjs`. Each URL runs 3 times on the desktop
preset.

| Budget                                                  | Level            |
| ------------------------------------------------------- | ---------------- |
| Accessibility ≥ 0.9                                     | ❌ fails the job |
| Best practices ≥ 0.9                                    | ❌ fails the job |
| SEO ≥ 0.9 (public pages)                                | ❌ fails the job |
| Performance ≥ 0.8, LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 300 ms | ⚠️ warning       |

Private pages are disallowed in `robots.txt`, so `is-crawlable` is
expected to fail there. Only their title, description and `lang` are
asserted. Reports are uploaded to temporary public storage (links in the
job log) and kept as a CI artifact.

Locally:

```bash
pnpm --filter shell build
SESSION_SECRET=dev pnpm lhci
```

## CI pipeline

`.github/workflows/ci-cd.yml` orchestrates reusable workflows:

```text
check-secrets, detect-changes
  └─ lint (reusable-lint.yml)
       ├─ Lint & Type Check + unit tests (affected)
       ├─ E2E (Playwright)
       └─ Lighthouse CI
  └─ build-packages ─► build-<app> ─► deploy-<app> (Vercel preview / production)
```

Deploy jobs run only when Vercel secrets and project ids are configured.
More detail in [deployment.md](./deployment.md).

## Writing good tests here

- Test **behaviour at boundaries**: what the user sees, what is reported,
  what is (not) loaded. Avoid testing internals.
- For async races (unmount while loading), control promises manually, as
  the `MfeHost` suite does.
- Stub `fetch` for `health.json` in `MfeHost` tests (`stubHealthy()`).
