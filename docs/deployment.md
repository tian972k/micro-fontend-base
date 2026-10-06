# Deployment

Each app is deployed **independently**. The shell finds MFEs through the
registry plus environment variables, so deploying, rolling back or
canarying one MFE never requires rebuilding the others.

## Build outputs

| App                                | Output               | Contains                                                                                |
| ---------------------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| shell                              | `apps/shell/build/`  | Remix server + client assets (`pnpm start` runs `remix-serve`)                          |
| app-react / vue / svelte / solidjs | `apps/<app>/dist/`   | `remoteEntry.js`, `mf-manifest.json`, `assets/`, `health.json`, standalone `index.html` |
| app-nextjs                         | `.next/` + `public/` | Next app + MFE bundle (`remoteEntry.js`, `mf-manifest.json`) in `public/`               |

MFE builds use a relative base, so you can serve a build from any path
(own domain, CDN folder, behind the proxy).

**CORS**: MFE origins must allow the shell's origin for `mf-manifest.json`,
`remoteEntry.js`, chunks and CSS. The Vite dev server already does.

## Vercel

One Vercel project per app, each with **Root Directory = `apps/<app>`**.
The CI workflows build with `vercel build` and deploy prebuilt output for
the Vite MFEs. The shell (and Next.js) is built in the cloud.

- `vercel.json` per app: `installCommand` installs workspace deps from the
  repo root, and `buildCommand` runs the Turborepo build for that app.
- The shell loads MFEs through its same-origin proxy
  `/api/proxy/<slug>/`. Configure, on the **shell** project:

  | Variable              | Example                                                      |
  | --------------------- | ------------------------------------------------------------ |
  | `SESSION_SECRET`      | `openssl rand -base64 32`                                    |
  | `VITE_APP_REACT_HOST` | `https://orbit-app-react.vercel.app`                         |
  | `VITE_APP_VUE_HOST`   | … one per slug (`react`, `nextjs`, `vue`, `svelte`, `solid`) |

- GitHub secrets for CI deploys: `VERCEL_TOKEN`, `VERCEL_ORG_ID` and
  `VERCEL_PROJECT_ID_<APP>`.

## Docker Compose

`docker-compose.yml` builds every app. The shell is exposed on `8000`
(container `3000`), MFEs on `8001`–`8005` (nginx on `80`). The browser
loads MFEs from `http://localhost:<port>`, which is what `getAppUrl()`
returns for a non-Vercel production build. Set `MFE_URL_<ID>` when the
public URLs differ, e.g. behind a reverse proxy.

```bash
pnpm docker:build && pnpm docker:up
```

## Any other platform

1. Serve each MFE `dist/` from a static host or CDN, with CORS for the
   shell origin.
2. Run the shell (`pnpm --filter shell build && pnpm --filter shell start`)
   with `SESSION_SECRET` and one `MFE_URL_<ID>` per MFE.

## Rollback & canary

`MFE_URL_<ID>` is read **per request** by the shell:

```bash
# roll app-react back to the previous immutable build
MFE_URL_APP_REACT=https://cdn.example.com/app-react/2024-06-01-abc123/
```

Recommended practice: publish every MFE build to an **immutable,
versioned path** (`/<app>/<version>/`), then promote, roll back or canary
by changing the variable.

- **Canary**: run a second shell deployment (or an edge rule) with a
  different `MFE_URL_<ID>` for a share of traffic.
- **Maintenance**: deploy `health.json` with `"status": "maintenance"` for
  that MFE.

Users with the page already open keep the version they loaded. They get
the new one on their next full page load, see
[edge-cases.md §3.1](./edge-cases.md#31-a-new-mfe-version-is-deployed-while-users-have-the-page-open).

## Release checklist

- [ ] CI green (types, lint, unit, e2e, Lighthouse)
- [ ] Shared framework majors unchanged, or the shell + all sharing MFEs
      release together
- [ ] New/changed events are additive, or shipped on a new namespace
- [ ] `health.json` version bumped (automatic per build)
- [ ] Rollback URL for the previous build noted
