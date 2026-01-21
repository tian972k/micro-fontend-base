# Vercel Deployment Guide

Quick guide để deploy Orbit micro-frontend trên Vercel với gateway pattern.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Setup](#setup)
3. [Configuration](#configuration)
4. [GitHub Secrets](#github-secrets)
5. [Deployment Flow](#deployment-flow)
6. [Troubleshooting](#troubleshooting)

---

## Architecture

**Mô hình Gateway Proxy:**

```
User Domain: example.com
    ↓
Shell Project (Gateway) - Remix
  ├─ /react/     → Proxy to app-react.vercel.app
  ├─ /vue/       → Proxy to app-vue.vercel.app
  ├─ /svelte/    → Proxy to app-svelte.vercel.app
  ├─ /solid/     → Proxy to app-solidjs.vercel.app
  └─ /next/      → Proxy to app-nextjs.vercel.app
```

**Ưu điểm:**

- Một domain chính (`example.com`)
- Mỗi MFE deploy độc lập trên Vercel
- CORS không cần (proxy server-side)
- Path-based routing tập trung ở shell

---

## Setup

### 1. Create Vercel Projects

Tạo 6 projects trên [vercel.com](https://vercel.com):

- `orbit-shell` (gateway)
- `orbit-app-react`
- `orbit-app-nextjs`
- `orbit-app-vue`
- `orbit-app-svelte`
- `orbit-app-solidjs`

Mỗi project:

- Chọn GitHub repo
- Set `rootDirectory`:
  - Shell: `apps/shell`
  - App React: `apps/app-react`
  - v.v.

### 2. Get Credentials

**Vercel Token:**

1. Dashboard > Settings > Tokens
2. Create > Copy token

**Organization ID:**

1. Settings > Account > Team ID
2. Copy

**Project IDs:**

1. Mỗi project > Settings > Project ID
2. Copy

---

## Configuration

### 1. Shell (Gateway) Config

File: `apps/shell/vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/react/:path*",
      "destination": "https://app-react.vercel.app/:path*"
    },
    {
      "source": "/vue/:path*",
      "destination": "https://app-vue.vercel.app/:path*"
    },
    {
      "source": "/svelte/:path*",
      "destination": "https://app-svelte.vercel.app/:path*"
    },
    {
      "source": "/solid/:path*",
      "destination": "https://app-solidjs.vercel.app/:path*"
    },
    {
      "source": "/next/:path*",
      "destination": "https://app-nextjs.vercel.app/:path*"
    }
  ]
}
```

Build command:

```bash
pnpm install --frozen-lockfile && pnpm turbo run build --filter shell
```

### 2. MFE Apps Config

Mỗi app có:

**File: `apps/app-{name}/.env`**

```
VITE_PUBLIC_BASE_PATH=/react/      # for react, adjust for others
```

**File: `apps/app-{name}/vite.config.mts`**

```typescript
export default createMfeConfig({
  appId: APP_IDS.REACT,
  // ...
  customBaseUrl: (isDev) =>
    isDev ? url : process.env.PUBLIC_BASE_PATH || "/react/",
});
```

**File: `apps/app-{name}/vercel.json`** (optional CORS)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://example.com"
        },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,POST" },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type,Authorization"
        }
      ]
    }
  ]
}
```

---

## GitHub Secrets

Set in GitHub repo > Settings > Secrets and variables > Actions:

| Secret                          | Value      | Source                      |
| ------------------------------- | ---------- | --------------------------- |
| `VERCEL_TOKEN`                  | Your token | Vercel > Settings > Tokens  |
| `VERCEL_ORG_ID`                 | Team ID    | Vercel > Settings > Account |
| `VERCEL_PROJECT_ID`             | Project ID | Shell project > Settings    |
| `VERCEL_PROJECT_ID_APP_REACT`   | Project ID | App React > Settings        |
| `VERCEL_PROJECT_ID_APP_NEXTJS`  | Project ID | App Next.js > Settings      |
| `VERCEL_PROJECT_ID_APP_VUE`     | Project ID | App Vue > Settings          |
| `VERCEL_PROJECT_ID_APP_SVELTE`  | Project ID | App Svelte > Settings       |
| `VERCEL_PROJECT_ID_APP_SOLIDJS` | Project ID | App SolidJS > Settings      |

---

## Deployment Flow

### CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

- **Orchestrator + Reusable jobs**: The main workflow only wires jobs together. Logic lives in `reusable-lint.yml`, `reusable-build.yml`, `reusable-deploy-vercel.yml`.
- **Order**:
  1. `check-secrets` → detect Docker/Vercel secret availability
  2. `detect-changes` → paths-filter (packages, root config, each app)
  3. `lint` → runs only when code changes are detected
  4. `build-packages` → runs when packages/root config change
  5. `build-shell`, `build-app-*` → per-app builds, skipped if unchanged
  6. `deploy-*` → runs only on push to `main` and when Vercel secrets + project IDs exist; reuses build artifacts with `--prebuilt`
  7. `summary` → writes job status to run summary

### Triggers

- **Deploy auto-runs on:** push to `main` (per-app deploy only if its build ran and Vercel secrets are present)
- **PRs:** run detect + lint + builds (no deploy)
- **Change detection:**
  - `apps/shell/**` → build shell
  - `apps/app-*/**` → build that app
  - `packages/**` or `pnpm-lock.yaml` or root configs → full rebuild

### Manual run

- GitHub Actions > `CI/CD Pipeline (Orchestrator)` > Run workflow (can target a branch for dry-run builds)

---

## Environment Variables

### Shell

File: `apps/shell/.env`

```dotenv
# Dev
SHELL_PORT=8000

# Prod (optional)
# VITE_GATEWAY_DOMAIN=https://example.com
# VITE_APP_REACT_HOST=https://app-react.vercel.app
```

### App React (example)

File: `apps/app-react/.env`

```dotenv
# Dev
VITE_APP_PORT=8001

# Prod (Vercel will set via vercel.json or CI)
PUBLIC_BASE_PATH=/react/
# VITE_GATEWAY_URL=https://example.com
```

---

## Domain Setup

### 1. Vercel Domain

In Vercel > Shell Project > Domains:

1. Add your domain (e.g., `example.com`)
2. Follow DNS setup instructions

### 2. DNS Records

Point to Vercel:

```
example.com  CNAME  cname.vercel.app
```

### 3. Verification

```bash
# Test gateway
curl https://example.com

# Test MFE via gateway proxy
curl https://example.com/react/
curl https://example.com/vue/

# Test MFE direct (technical host)
curl https://app-react.vercel.app
```

---

## Monitoring

### Vercel Dashboard

- **Deployments**: Vercel > Deployments (see build logs)
- **Analytics**: Vercel > Analytics (performance, errors)
- **Logs**: Vercel > Logs (runtime)

### GitHub Actions

- **Workflow Runs**: GitHub > Actions > CI/CD
- **Job Logs**: Click run > see step logs
- **Artifacts**: Download build artifacts (1-day retention)

---

## Troubleshooting

### Deploy fails with "Missing PROJECT_ID"

**Fix:** Set `VERCEL_PROJECT_ID_APP_*` in GitHub secrets.

### Build succeeds but deploy skipped

**Reason:**

- Branch is not `main`
- Vercel secrets missing
- Build failed

**Check:** GitHub Actions > ci-cd > see "if:" condition in logs

### CORS errors in browser

**Fix:**

1. Update `vercel.json` in app (add CORS headers)
2. Or check if gateway proxy is setup correctly in shell

### Base path issue (assets 404)

**Fix:**

1. Set `PUBLIC_BASE_PATH=/react/` in `.env`
2. Update vite config with `customBaseUrl`
3. Verify `vercel.json` rewrite targets are correct

### Artifact expired

Artifacts retained 1 day. If needed longer:

- Download before expiry
- Or re-trigger build

---

## Advanced

### Custom Domain per MFE

Want `react.example.com` instead of `example.com/react`?

1. Add domain to each app's Vercel project
2. Set DNS CNAME for each subdomain
3. Skip shell proxy (simpler DNS, less centralized)

### Preview Deployments

Each PR triggers Vercel preview:

- Shell: `shell-git-{branch}.vercel.app`
- Apps: `app-react-git-{branch}.vercel.app`
- Preview `vercel.json` rewrites use preview hosts (dynamic routing needed)

### Environment Variables per App

Set in Vercel Project > Settings > Environment Variables, or via `.env.production`.

---

## References

- [Vercel Docs](https://vercel.com/docs)
- [Vercel API Reference](https://vercel.com/docs/api)
- [Module Federation Guide](../docs/ARCHITECTURE.md)
