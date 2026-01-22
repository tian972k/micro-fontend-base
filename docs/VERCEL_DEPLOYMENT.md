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

**Mô hình API Proxy:**

```
User Domain: micro-fontend-base-shell.vercel.app
    ↓
Shell Project (Gateway) - Remix
  ├─ /api/proxy/react/*   → Proxy to micro-fontend-base-app-react.vercel.app
  ├─ /api/proxy/vue/*     → Proxy to micro-fontend-base-app-vue.vercel.app
  ├─ /api/proxy/svelte/*  → Proxy to micro-fontend-base-app-svelte.vercel.app
  ├─ /api/proxy/solid/*   → Proxy to micro-fontend-base-app-solidjs.vercel.app
  └─ /api/proxy/nextjs/*  → Proxy to micro-fontend-base-app-nextjs.vercel.app
```

**Ưu điểm:**

- Một domain chính cho tất cả MFE
- Server-side proxy - không có CORS issues
- Health check với caching (5 phút)
- Performance optimization cho static assets
- Independent deployment cho mỗi MFE

---

## Setup

### 1. Create Vercel Projects

Tạo 6 projects trên [vercel.com](https://vercel.com):

- `micro-fontend-base-shell` (gateway)
- `micro-fontend-base-app-react`
- `micro-fontend-base-app-nextjs`
- `micro-fontend-base-app-vue`
- `micro-fontend-base-app-svelte`
- `micro-fontend-base-app-solidjs`

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

### 1. Shell Environment Variables (Vercel Dashboard)

Đặt các biến môi trường này trong Vercel Project Settings > Environment Variables:

| Variable               | Value                                               | Description        |
| ---------------------- | --------------------------------------------------- | ------------------ |
| `VERCEL`               | `1`                                                 | Auto-set by Vercel |
| `VITE_APP_REACT_HOST`  | `https://micro-fontend-base-app-react.vercel.app`   | React MFE host     |
| `VITE_APP_NEXTJS_HOST` | `https://micro-fontend-base-app-nextjs.vercel.app`  | Next.js MFE host   |
| `VITE_APP_VUE_HOST`    | `https://micro-fontend-base-app-vue.vercel.app`     | Vue MFE host       |
| `VITE_APP_SVELTE_HOST` | `https://micro-fontend-base-app-svelte.vercel.app`  | Svelte MFE host    |
| `VITE_APP_SOLID_HOST`  | `https://micro-fontend-base-app-solidjs.vercel.app` | SolidJS MFE host   |

### 2. Shell vercel.json

File: `apps/shell/vercel.json`

```json
{
  "git": {
    "deploymentEnabled": false
  },
  "buildCommand": "cd ../.. && pnpm install && VERCEL=1 pnpm turbo run build --filter=shell",
  "env": {
    "VERCEL": "1"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://micro-fontend-base-shell.vercel.app"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,OPTIONS,POST"
        }
      ]
    }
  ]
}
```

### 3. API Proxy Route Structure

Shell sử dụng Remix route để proxy requests tới MFE apps:

```
apps/shell/app/routes/api/
└── proxy/
    ├── route.ts          → GET /api/proxy (list available apps)
    └── $/
        └── route.ts      → GET /api/proxy/:app/* (proxy to MFE)
```

**Proxy Features:**

- Health check caching (5 phút TTL)
- Skip health check cho static assets (JS, CSS, fonts, images)
- Aggressive caching cho hashed files (1 năm)
- Automatic content-encoding handling
- CORS headers injection

### 4. MFE Apps Config

Mỗi MFE app cần có `health.json` trong `public/`:

**File: `apps/app-react/public/health.json`**

```json
{
  "status": "available",
  "version": "1.0.0",
  "message": "React MFE is healthy"
}
```

---

## GitHub Secrets

Set in GitHub repo > Settings > Secrets and variables > Actions:

**Required Vercel Secrets (CI/CD Deployment):**

| Secret Name                 | Value                | How to Get                              |
| --------------------------- | -------------------- | --------------------------------------- |
| `VERCEL_TOKEN`              | Authentication token | Vercel > Account > Tokens > Create      |
| `VERCEL_ORG_ID`             | Account/Team ID      | Vercel > Account > Team ID              |
| `VERCEL_PROJECT_ID_SHELL`   | Shell project ID     | Vercel > shell project > Settings       |
| `VERCEL_PROJECT_ID_REACT`   | React app ID         | Vercel > app-react project > Settings   |
| `VERCEL_PROJECT_ID_NEXTJS`  | Next.js app ID       | Vercel > app-nextjs project > Settings  |
| `VERCEL_PROJECT_ID_VUE`     | Vue app ID           | Vercel > app-vue project > Settings     |
| `VERCEL_PROJECT_ID_SVELTE`  | Svelte app ID        | Vercel > app-svelte project > Settings  |
| `VERCEL_PROJECT_ID_SOLIDJS` | SolidJS app ID       | Vercel > app-solidjs project > Settings |

**Setup Steps:**

1. Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens)
2. Create new token → Copy
3. Go to GitHub repo > Settings > Secrets and variables > Actions
4. Click **New repository secret** → Add each secret above
5. Workflow will auto-detect and deploy apps with valid secrets

**Optional Variables (for Turbo remote cache):**

| Variable            | Value             | Notes                  |
| ------------------- | ----------------- | ---------------------- |
| `TURBO_TEAM`        | Turbo team slug   | Needed if remote cache |
| `TURBO_REMOTE_ONLY` | `true` or `false` | Default `false`        |

**Optional Docker secrets (if pushing images):**

| Secret               | Value           |
| -------------------- | --------------- |
| `DOCKERHUB_USERNAME` | Docker Hub user |
| `DOCKERHUB_TOKEN`    | Access token    |

**Repository variables (optional, for Turbo remote cache):**

| Variable            | Value             | Notes                  |
| ------------------- | ----------------- | ---------------------- |
| `TURBO_TEAM`        | Turbo team slug   | Needed if remote cache |
| `TURBO_REMOTE_ONLY` | `true` or `false` | Default `false`        |

**Optional Docker secrets (if pushing images):**

| Secret               | Value           |
| -------------------- | --------------- |
| `DOCKERHUB_USERNAME` | Docker Hub user |
| `DOCKERHUB_TOKEN`    | Access token    |

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

### CORE_NOT_FOUND Error

**Problem:** Browser console shows `Error: CORE_NOT_FOUND`

**Causes:**

1. MFE health.json returns 404
2. Wrong `VITE_APP_*_HOST` environment variable
3. MFE app not deployed

**Solutions:**

```bash
# 1. Test MFE health directly
curl https://micro-fontend-base-app-react.vercel.app/health.json

# 2. Check environment variables in Vercel Dashboard
# Shell Project > Settings > Environment Variables
# Ensure VITE_APP_REACT_HOST is set correctly

# 3. Verify MFE is deployed
curl -I https://micro-fontend-base-app-react.vercel.app/
```

### ERR_CONTENT_DECODING_FAILED

**Problem:** Browser fails to decode proxy response

**Cause:** Proxy forwards `content-encoding` header but body is already decoded

**Solution:** Already fixed in proxy route - removes encoding headers:

- `content-encoding`
- `content-length`
- `transfer-encoding`

### Deploy fails with "Missing PROJECT_ID"

**Fix:** Ensure the correct secret name for each app exists in GitHub Actions secrets:

- Shell: `VERCEL_PROJECT_ID_SHELL`
- React: `VERCEL_PROJECT_ID_REACT`
- Next.js: `VERCEL_PROJECT_ID_NEXTJS`
- Vue: `VERCEL_PROJECT_ID_VUE`
- Svelte: `VERCEL_PROJECT_ID_SVELTE`
- SolidJS: `VERCEL_PROJECT_ID_SOLIDJS`

### Build succeeds but deploy skipped

**Reason:**

- Branch is not `main`
- Missing Vercel secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, or the app's `VERCEL_PROJECT_ID_*`)
- The app didn't build (no changes and not part of a full rebuild)

**Check:**

- GitHub Actions → Run → Job → expand `if:` evaluation to see why it skipped
- `check-secrets` job outputs:
  - `has_token`, `has_org_id`, `has_project_id_shell` (and others) should be `true`
- `detect-changes` job outputs:
  - `shell_changed` (or the app's changed flag) should be `true` OR `needs_full_rebuild=true`

**Deploy only Shell:**

1. Add only `VERCEL_PROJECT_ID_SHELL`
2. Push to `main`
3. Expect: `deploy-shell` runs; others skipped

### Slow MFE Loading

**Problem:** MFE takes long time to load

**Causes:**

1. Health check running on every request
2. No caching headers

**Solutions (already implemented):**

- Static assets skip health check (JS, CSS, fonts, images)
- Hashed files cached for 1 year (`Cache-Control: immutable`)
- Other static files cached for 1 hour
- Health check results cached for 5 minutes

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

## Testing Production Deployment Locally

### Using `.env.production` for Local Testing

Vite automatically loads `.env.production` when `NODE_ENV=production`. This allows you to test the Vercel deployment strategy locally without pushing to the cloud.

**File: `apps/shell/.env.production`**

```bash
# Local production testing - simulates Vercel deployment
VERCEL=1
VITE_GATEWAY_DOMAIN=https://micro-fontend-base-shell.vercel.app
MFE_LOADING_MODE=manifest
```

### Local Production Testing Steps

1. **Build production bundle:**

   ```bash
   # From root
   cd apps/shell
   NODE_ENV=production pnpm build
   ```

2. **Start production server:**

   ```bash
   # Uses .env.production (auto-loaded by Vite)
   NODE_ENV=production pnpm start
   ```

3. **Expected behavior:**
   - Shell server starts on <http://localhost:8000>
   - App URLs resolve as relative paths: `/react/`, `/vue/`, etc.
   - Server-side proxy in `app/server/config.ts` will:
     - Check `process.env.VERCEL` flag (=1)
     - Return relative paths for Vercel deployment
     - MFE loads from gateway via rewrite rules

4. **Differences from actual Vercel deployment:**
   - Local: Shell runs on `http://localhost:8000` (not HTTPS)
   - Local: MFE rewrites are server-side only
   - Vercel: HTTPS enabled, Vercel edge middleware handles rewrites
   - **Behavior is identical** - both use relative paths and gateway proxy pattern

### Environment Variable Loading Order

Vite loads environment files in this order (later files override earlier):

1. `.env` - Default for all environments
2. `.env.development` - When `NODE_ENV=development`
3. `.env.production` - When `NODE_ENV=production`
4. `.env.local` - Local overrides (gitignored)

**In this project:**

- **Development** (`pnpm dev`): Uses `.env` + `.env.development` → localhost URLs
- **Production local** (`NODE_ENV=production pnpm build && pnpm start`): Uses `.env` + `.env.production` → relative paths + VERCEL flag
- **Vercel**: Uses `.env` + `.env.production` + Vercel Platform settings → relative paths + VERCEL=1 auto-set

### Key Flag: `VERCEL=1`

The `process.env.VERCEL` flag in `app/server/config.ts` determines MFE URL resolution:

```typescript
// From apps/shell/app/server/config.ts
const getAppUrl = (appId: string) => {
  // Development: localhost
  if (isDevelopment) return `http://localhost:${PORT}`;

  // Production: Vercel deployment or local .env.production
  if (process.env.VERCEL) return "/react/"; // Relative path

  // Docker: exposed ports
  if (isDocker) return `http://localhost:${DOCKER_PORT}`;
};
```

- `process.env.VERCEL`: Set by Vercel platform OR `.env.production`
- When true: Returns relative paths (`/react/`, `/vue/`, etc.)
- When false: Falls back to Docker or localhost ports

---

## References

- [Vercel Docs](https://vercel.com/docs)
- [Vercel API Reference](https://vercel.com/docs/api)
- [Module Federation Guide](../docs/ARCHITECTURE.md)
